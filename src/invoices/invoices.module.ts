import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { ProductsModule } from '../products/products.module';
import { PaymentsModule } from '../payments/payments.module';
import { InvoicesSeeder } from './invoices.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    ProductsModule,
    PaymentsModule
  ],
  providers: [InvoicesService, InvoicesSeeder],
  controllers: [InvoicesController],
  exports: [InvoicesService, InvoicesSeeder],
})
export class InvoicesModule {}
