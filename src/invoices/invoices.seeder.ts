import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class InvoicesSeeder {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemsRepository: Repository<InvoiceItem>,
    private readonly productsService: ProductsService,
  ) {}

  async seed(count: number = 10) {
    // Check if invoices already exist
    const existingCount = await this.invoicesRepository.count();
    if (existingCount > 0) {
      console.log('⏩ Invoices already exist, skipping seeding');
      return;
    }
    
    console.log('🌱 Seeding invoices...');
    
    // Get all available products first
    const products = await this.productsService.findAll();
    if (products.length === 0) {
      console.log('❌ No products found. Please seed products first.');
      return;
    }

    for (let i = 0; i < count; i++) {
      // Create invoice
      const invoice = new Invoice();
      invoice.description = faker.commerce.productDescription();
      invoice.dueDate = faker.date.future();

      // Add 1-3 random items
      const numberOfItems = faker.number.int({ min: 1, max: 3 });
      let totalAmount = 0;

      const items: InvoiceItem[] = [];
      for (let j = 0; j < numberOfItems; j++) {
        const randomProduct = products[faker.number.int({ min: 0, max: products.length - 1 })];
        const quantity = faker.number.int({ min: 1, max: 5 });
        
        const item = new InvoiceItem();
        item.product = randomProduct;
        item.description = randomProduct.name;
        item.quantity = quantity;
        item.unitPrice = randomProduct.currentPrice;
        item.total = quantity * randomProduct.currentPrice;
        item.invoice = invoice;
        
        totalAmount += item.total;
        items.push(item);
      }

      invoice.totalPayableAmount = totalAmount;
      invoice.remainingAmount = totalAmount;

      // Save invoice and its items
      await this.invoicesRepository.save(invoice);
      await this.invoiceItemsRepository.save(items);
    }

    console.log(`✅ Successfully seeded ${count} invoices`);
  }

  async clear() {
    await this.invoiceItemsRepository.clear();
    await this.invoicesRepository.clear();
    console.log('🧹 Cleared all invoices');
  }
}