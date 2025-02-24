import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity';
import { PaymentsResolver } from './payments.resolver';
import { AuthModule } from '../auth/auth.module';
import { JSONScalar } from '../shared/scalars/json.scalar';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice, InvoiceItem]),
    AuthModule
  ],
  providers: [PaymentsService, PaymentsResolver, JSONScalar],
  controllers: [PaymentsController],
})
export class PaymentsModule {}