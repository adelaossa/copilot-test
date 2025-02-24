import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentDistributionType, ItemDistributionType, InvoicePaymentApplication, InvoiceItemPaymentApplication } from './types/payment-distribution.types';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    private dataSource: DataSource
  ) {}

  private distributeItemsProportionally(amount: number, items: InvoiceItem[]): InvoiceItemPaymentApplication[] {
    const totalRemaining = items.reduce((sum, item) => sum + Number(item.remainingAmount), 0);
    let remainingDistribution = amount;

    return items.map((item, index, array) => {
      const isLast = index === array.length - 1;
      const proportion = Number(item.remainingAmount) / totalRemaining;
      
      // For the last item, use remaining distribution to avoid rounding errors
      const appliedAmount = isLast 
        ? remainingDistribution 
        : Math.min(Number((amount * proportion).toFixed(2)), Number(item.remainingAmount));
      
      remainingDistribution -= appliedAmount;

      return {
        itemId: item.id,
        appliedAmount
      };
    });
  }

  private distributeItemsInOrder(amount: number, items: InvoiceItem[]): InvoiceItemPaymentApplication[] {
    let remainingAmount = amount;

    return items.map((item, index, array) => {
      if (remainingAmount <= 0) return { itemId: item.id, appliedAmount: 0 };
      
      const isLast = index === array.length - 1;
      // For the last item, use remaining amount to avoid rounding errors
      const appliedAmount = isLast
        ? remainingAmount
        : Math.min(Number(remainingAmount.toFixed(2)), Number(item.remainingAmount));
      
      remainingAmount -= appliedAmount;
      
      return {
        itemId: item.id,
        appliedAmount
      };
    });
  }

  private async distributePaymentToItems(
    amount: number,
    invoice: Invoice,
    itemDistributionType: ItemDistributionType,
    queryRunner: any
  ): Promise<InvoiceItemPaymentApplication[]> {
    const itemRepository = queryRunner.manager.getRepository(InvoiceItem);
    
    const items = await itemRepository
      .createQueryBuilder('item')
      .where('item.invoiceId = :invoiceId', { invoiceId: invoice.id })
      .orderBy('item.id', 'ASC')
      .getMany();

    console.log(`Before distribution - Invoice ${invoice.id} items:`, items.map(item => ({
      id: item.id,
      remainingAmount: item.remainingAmount
    })));

    const itemDistribution = itemDistributionType === ItemDistributionType.PROPORTIONAL
      ? this.distributeItemsProportionally(amount, items)
      : this.distributeItemsInOrder(amount, items);

    console.log(`Payment distribution for Invoice ${invoice.id}:`, itemDistribution);

    // Update remaining amounts on items using raw SQL update
    for (const payment of itemDistribution) {
      const appliedAmount = Number(payment.appliedAmount).toFixed(2);
      console.log(`Updating item ${payment.itemId}:`, {
        appliedAmount,
      });
      
      // Use raw SQL update to ensure decimal precision
      await queryRunner.query(
        `UPDATE invoice_item SET "remainingAmount" = "remainingAmount" - $1 WHERE id = $2`,
        [appliedAmount, payment.itemId]
      );
    }

    // Verify the updates
    const updatedItems = await itemRepository
      .createQueryBuilder('item')
      .where('item.invoiceId = :invoiceId', { invoiceId: invoice.id })
      .orderBy('item.id', 'ASC')
      .getMany();

    console.log(`After distribution - Invoice ${invoice.id} items:`, updatedItems.map(item => ({
      id: item.id,
      remainingAmount: item.remainingAmount
    })));

    return itemDistribution;
  }

  private distributePaymentProportionally(amount: number, invoices: Invoice[]): Promise<InvoicePaymentApplication[]> {
    const totalRemaining = invoices.reduce((sum, inv) => sum + Number(inv.remainingAmount), 0);
    let remainingDistribution = amount;
    
    const distribution = invoices.map((invoice, index, array) => {
      const isLast = index === array.length - 1;
      const proportion = Number(invoice.remainingAmount) / totalRemaining;
      
      // For the last invoice, use remaining distribution to avoid rounding errors
      const appliedAmount = isLast 
        ? remainingDistribution 
        : Math.min(Number((amount * proportion).toFixed(2)), Number(invoice.remainingAmount));
      
      remainingDistribution -= appliedAmount;

      return {
        invoiceId: invoice.id,
        appliedAmount,
        itemDistributions: []
      };
    });

    return Promise.resolve(distribution);
  }

  private distributePaymentOldestFirst(amount: number, invoices: Invoice[]): Promise<InvoicePaymentApplication[]> {
    let remainingAmount = amount;
    const sortedInvoices = [...invoices].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    
    const distribution = sortedInvoices.map((invoice, index, array) => {
      if (remainingAmount <= 0) return { 
        invoiceId: invoice.id, 
        appliedAmount: 0,
        itemDistributions: []
      };
      
      const isLast = index === array.length - 1;
      // For the last invoice, use remaining amount to avoid rounding errors
      const appliedAmount = isLast
        ? remainingAmount
        : Math.min(Number(remainingAmount.toFixed(2)), Number(invoice.remainingAmount));
      
      remainingAmount -= appliedAmount;
      
      return {
        invoiceId: invoice.id,
        appliedAmount,
        itemDistributions: []
      };
    });

    return Promise.resolve(distribution);
  }

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('Starting payment process for invoices:', createPaymentDto.invoiceIds);

      const invoices = await Promise.all(
        createPaymentDto.invoiceIds.map(async id => {
          const invoice = await queryRunner.manager
            .getRepository(Invoice)
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.items', 'items')
            .where('invoice.id = :id', { id })
            .getOne();

          if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
          }

          console.log(`Found invoice ${id}:`, {
            remainingAmount: invoice.remainingAmount,
            itemsCount: invoice.items.length
          });

          return invoice;
        })
      );

      // Calculate total remaining amount
      const totalRemaining = invoices.reduce((sum, invoice) => sum + Number(invoice.remainingAmount), 0);
      console.log('Total remaining amount:', totalRemaining);

      // Verify payment amount
      if (createPaymentDto.amount > totalRemaining) {
        throw new BadRequestException('Payment amount exceeds total remaining amount');
      }

      // Get initial distribution across invoices
      const distribution = await (createPaymentDto.distributionType === PaymentDistributionType.PROPORTIONAL
        ? this.distributePaymentProportionally(createPaymentDto.amount, invoices)
        : this.distributePaymentOldestFirst(createPaymentDto.amount, invoices));

      console.log('Initial payment distribution:', distribution);

      // For each invoice with a payment, distribute to items
      for (const invDist of distribution) {
        if (invDist.appliedAmount > 0) {
          const invoice = invoices.find(inv => inv.id === invDist.invoiceId);
          if (invoice) {
            console.log(`Processing invoice ${invoice.id} with amount ${invDist.appliedAmount}`);

            invDist.itemDistributions = await this.distributePaymentToItems(
              invDist.appliedAmount,
              invoice,
              createPaymentDto.itemDistributionType,
              queryRunner
            );

            // Update invoice remaining amount using raw SQL to avoid overwriting item changes
            const currentRemaining = Number(invoice.remainingAmount);
            const appliedAmount = Number(invDist.appliedAmount);
            const newRemainingAmount = Number((currentRemaining - appliedAmount).toFixed(2));
            
            console.log(`Updating invoice ${invoice.id} remaining amount:`, {
              before: currentRemaining,
              applied: appliedAmount,
              after: newRemainingAmount
            });

            await queryRunner.query(
              `UPDATE invoice SET "remainingAmount" = $1 WHERE id = $2`,
              [newRemainingAmount, invoice.id]
            );
            
            // Update the local invoice object to keep it in sync
            invoice.remainingAmount = newRemainingAmount;
          }
        }
      }
      
      // Create and save payment record
      const payment = new Payment();
      payment.amount = createPaymentDto.amount;
      payment.method = createPaymentDto.method;
      payment.status = PaymentStatus.COMPLETED;
      payment.distributionType = createPaymentDto.distributionType;
      payment.itemDistributionType = createPaymentDto.itemDistributionType;
      payment.paymentDistribution = distribution;
      payment.invoices = invoices;

      const savedPayment = await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();

      console.log('Payment completed successfully:', {
        paymentId: savedPayment.id,
        amount: savedPayment.amount,
        distribution: savedPayment.paymentDistribution
      });
      
      return savedPayment;

    } catch (err) {
      console.error('Error during payment processing:', err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['invoices']
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['invoices']
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }
}