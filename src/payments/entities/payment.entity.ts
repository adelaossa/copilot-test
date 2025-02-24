import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, OneToMany } from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { PaymentDistributionType, ItemDistributionType, InvoicePaymentApplication } from '../types/payment-distribution.types';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash'
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod
  })
  method: PaymentMethod;

  @ManyToMany(() => Invoice)
  @JoinTable()
  invoices: Invoice[];

  @Column({
    type: 'enum',
    enum: PaymentDistributionType
  })
  distributionType: PaymentDistributionType;

  @Column({
    type: 'enum',
    enum: ItemDistributionType
  })
  itemDistributionType: ItemDistributionType;

  @Column('jsonb')
  paymentDistribution: InvoicePaymentApplication[];
}