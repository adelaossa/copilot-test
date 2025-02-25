import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Client } from '../../clients/entities/client.entity';

@ObjectType()
@Entity()
export class Invoice {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  description: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  totalPayableAmount: number;

  @Field()
  @Column()
  dueDate: Date;

  @Field(() => [InvoiceItem])
  @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  remainingAmount: number;

  @Field(() => [Payment])
  @ManyToMany(() => Payment, payment => payment.invoices)
  payments: Payment[];

  @Field(() => Client)
  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ name: 'clientId' })
  clientId: number;

  @BeforeInsert()
  setInitialRemainingAmount() {
    this.remainingAmount = this.totalPayableAmount;
  }

  hasPayments(): boolean {
    return this.payments && this.payments.length > 0;
  }
}
