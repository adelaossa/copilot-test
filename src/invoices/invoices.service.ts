import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceItem } from './entities/invoice-item.entity';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class InvoicesService {
  private readonly PRICE_COMPARISON_TOLERANCE = 0.001;

  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
    private productsService: ProductsService,
  ) {}

  findAll(): Promise<Invoice[]> {
    return this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .getMany();
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('invoice.id = :id', { id })
      .getOne();

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }
    return invoice;
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    if (!invoice) {
      throw new Error(`Invoice with id ${id} not found`);
    }

    if (invoice.hasPayments()) {
      throw new BadRequestException('Cannot delete an invoice that has received payments');
    }

    await this.invoicesRepository.manager.delete(InvoiceItem, { invoice: { id } });
    await this.invoicesRepository.delete(id);
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    try {
      const totalItemsValue = createInvoiceDto.items.reduce((sum, item) => sum + item.total, 0);
      if (Math.abs(totalItemsValue - createInvoiceDto.totalPayableAmount) > this.PRICE_COMPARISON_TOLERANCE) {
        throw new BadRequestException('Total value of items does not match total payable amount');
      }

      const invoice = new Invoice();
      invoice.description = createInvoiceDto.description;
      invoice.totalPayableAmount = createInvoiceDto.totalPayableAmount;
      invoice.dueDate = createInvoiceDto.dueDate;
      
      // Save the invoice first
      const savedInvoice = await this.invoicesRepository.save(invoice);

      // Process and save each item
      for (const itemDto of createInvoiceDto.items) {
        try {
          const product = await this.productsService.findOne(itemDto.productId);
          
          // Convert both values to numbers and compare with tolerance
          const productPrice = Number(product.currentPrice);
          const itemPrice = Number(itemDto.unitPrice);
          if (Math.abs(itemPrice - productPrice) > this.PRICE_COMPARISON_TOLERANCE) {
            throw new BadRequestException(`Unit price ${itemPrice} does not match product's current price ${productPrice}`);
          }

          const item = new InvoiceItem();
          item.description = itemDto.description;
          item.quantity = itemDto.quantity;
          item.unitPrice = itemDto.unitPrice;
          item.total = itemDto.total;
          item.invoice = savedInvoice;
          item.product = product;
          await this.invoiceItemsRepository.save(item);
        } catch (error) {
          // If there's an error with any item, delete the invoice and throw the error
          await this.invoicesRepository.delete(savedInvoice.id);
          throw error;
        }
      }

      return this.findOne(savedInvoice.id);
    } catch (error) {
      if (error.status === 404) {
        throw new BadRequestException(`Product not found: ${error.message}`);
      }
      throw error;
    }
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.hasPayments()) {
      throw new BadRequestException('Cannot modify an invoice that has received payments');
    }
    
    if (updateInvoiceDto.description) {
      invoice.description = updateInvoiceDto.description;
    }
    if (updateInvoiceDto.totalPayableAmount) {
      invoice.totalPayableAmount = updateInvoiceDto.totalPayableAmount;
    }
    if (updateInvoiceDto.dueDate) {
      invoice.dueDate = updateInvoiceDto.dueDate;
    }
    // Update the items if provided
    if (updateInvoiceDto.items) {
      // Delete existing items
      await this.invoicesRepository.manager.delete(InvoiceItem, { invoice: { id } });

      // Save the new items
      for (const itemDto of updateInvoiceDto.items) {
      const item = new InvoiceItem();
      item.description = itemDto.description;
      item.quantity = itemDto.quantity;
      item.unitPrice = itemDto.unitPrice;
      item.total = itemDto.total;
      item.invoice = invoice;
      await this.invoiceItemsRepository.save(item);
      }
    }
    await this.invoicesRepository.save(invoice);
    
    return invoice;
  }
}
