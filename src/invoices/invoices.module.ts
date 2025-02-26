import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { ProductsModule } from '../products/products.module';
import { PaymentsModule } from '../payments/payments.module';
import { InvoicesSeeder } from './invoices.seeder';
import { InvoicesResolver } from './invoices.resolver';
import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';
import { Client } from '../clients/entities/client.entity';
import { I18nModule } from '../i18n/i18n.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Client]),
    ProductsModule,
    PaymentsModule,
    AuthModule,
    ClientsModule,
    I18nModule
  ],
  providers: [InvoicesService, InvoicesSeeder, InvoicesResolver],
  controllers: [InvoicesController],
  exports: [InvoicesService, InvoicesSeeder],
})
export class InvoicesModule {}
