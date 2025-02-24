import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Invoice, InvoiceItem])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}