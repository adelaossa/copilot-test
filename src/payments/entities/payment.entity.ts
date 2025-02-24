import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
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

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});

registerEnumType(PaymentDistributionType, {
  name: 'PaymentDistributionType',
});

registerEnumType(ItemDistributionType, {
  name: 'ItemDistributionType',
});

@ObjectType()
@Entity()
export class Payment {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Field()
  @CreateDateColumn()
  paymentDate: Date;

  @Field(() => PaymentStatus)
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Field(() => PaymentMethod)
  @Column({
    type: 'enum',
    enum: PaymentMethod
  })
  method: PaymentMethod;

  @Field(() => [Invoice])
  @ManyToMany(() => Invoice)
  @JoinTable()
  invoices: Invoice[];

  @Field(() => PaymentDistributionType)
  @Column({
    type: 'enum',
    enum: PaymentDistributionType
  })
  distributionType: PaymentDistributionType;

  @Field(() => ItemDistributionType)
  @Column({
    type: 'enum',
    enum: ItemDistributionType
  })
  itemDistributionType: ItemDistributionType;

  @Column('jsonb')
  paymentDistribution: InvoicePaymentApplication[];
}