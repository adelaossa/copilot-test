import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceItemDto } from './dto/invoice-item.dto';
import { InvoiceItem } from './entities/invoice-item.entity';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
  ) {}

  findAll(): Promise<Invoice[]> {
    return this.invoicesRepository.find();
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOneBy({ id });
    if (!invoice) {
      throw new Error(`Invoice with id ${id} not found`);
    }
    return invoice;
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    if (!invoice) {
      throw new Error(`Invoice with id ${id} not found`);
    }
    await this.invoicesRepository.manager.delete(InvoiceItem, { invoice: { id } });
    await this.invoicesRepository.delete(id);
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const totalItemsValue = createInvoiceDto.items.reduce((sum, item) => sum + item.total, 0);
    if (totalItemsValue !== createInvoiceDto.totalPayableAmount) {
      throw new BadRequestException('Total value of items does not match total payable amount');
    }
    const invoice = new Invoice();
    invoice.description = createInvoiceDto.description;
    invoice.totalPayableAmount = createInvoiceDto.totalPayableAmount;
    invoice.dueDate = createInvoiceDto.dueDate;
    // Save the invoice to the database
    const savedInvoice = await this.invoicesRepository.save(invoice);

    // Save the items to the database
    for (const itemDto of createInvoiceDto.items) {
      const item = new InvoiceItem();
      item.description = itemDto.description;
      item.quantity = itemDto.quantity;
      item.unitPrice = itemDto.unitPrice;
      item.total = itemDto.total;
      item.invoice = savedInvoice;
      await this.invoiceItemsRepository.save(item);
    }

    return this.invoicesRepository.save(invoice);
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    
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
