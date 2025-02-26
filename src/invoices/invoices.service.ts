import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceItem } from './entities/invoice-item.entity';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { ProductsService } from '../products/products.service';
import { Client } from '../clients/entities/client.entity';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class InvoicesService {
  private readonly PRICE_COMPARISON_TOLERANCE = 0.001;

  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private productsService: ProductsService,
    private translationService: TranslationService
  ) {}

  findAll(): Promise<Invoice[]> {
    return this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('invoice.client', 'client')
      .getMany();
  }

  async findOne(id: number, lang: string = 'en'): Promise<Invoice> {
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('invoice.client', 'client')
      .where('invoice.id = :id', { id })
      .getOne();

    if (!invoice) {
      const errorMessage = await this.translationService.translateAsync('errors.notFound', lang);
      throw new NotFoundException(errorMessage);
    }
    return invoice;
  }

  async remove(id: number, lang: string = 'en'): Promise<void> {
    const invoice = await this.findOne(id, lang);
    if (!invoice) {
      const errorMessage = await this.translationService.translateAsync('errors.notFound', lang);
      throw new NotFoundException(errorMessage);
    }

    if (invoice.hasPayments()) {
      const errorMessage = await this.translationService.translateAsync('invoice.errors.hasPayments', lang);
      throw new BadRequestException(errorMessage);
    }

    await this.invoiceItemsRepository.delete({ invoice: { id } });
    await this.invoicesRepository.delete(id);
  }

  async create(createInvoiceDto: CreateInvoiceDto, lang: string = 'en'): Promise<Invoice> {
    try {
      // Validate client exists
      const client = await this.clientsRepository.findOne({ 
        where: { id: createInvoiceDto.clientId }
      });
      
      if (!client) {
        const errorMessage = await this.translationService.translateAsync('errors.notFound', lang);
        throw new NotFoundException(errorMessage);
      }

      const totalItemsValue = createInvoiceDto.items.reduce((sum, item) => sum + item.total, 0);
      if (Math.abs(totalItemsValue - createInvoiceDto.totalPayableAmount) > this.PRICE_COMPARISON_TOLERANCE) {
        const errorMessage = await this.translationService.translateAsync('invoice.errors.itemsMismatch', lang);
        throw new BadRequestException(errorMessage);
      }

      const invoice = new Invoice();
      invoice.description = createInvoiceDto.description;
      invoice.totalPayableAmount = createInvoiceDto.totalPayableAmount;
      invoice.dueDate = createInvoiceDto.dueDate;
      invoice.client = client;
      
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
            const errorMessage = await this.translationService.translateAsync('invoice.errors.priceChanged', lang);
            throw new BadRequestException(errorMessage);
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

      return this.findOne(savedInvoice.id, lang);
    } catch (error) {
      if (error.status === 404) {
        const errorMessage = await this.translationService.translateAsync('errors.notFound', lang);
        throw new BadRequestException(errorMessage);
      }
      throw error;
    }
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto, lang: string = 'en'): Promise<Invoice> {
    const invoice = await this.findOne(id, lang);

    if (invoice.hasPayments()) {
      const errorMessage = await this.translationService.translateAsync('invoice.errors.hasPayments', lang);
      throw new BadRequestException(errorMessage);
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
