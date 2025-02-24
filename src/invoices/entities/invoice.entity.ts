import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, BeforeInsert } from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPayableAmount: number;

  @Column()
  dueDate: Date;

  @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  remainingAmount: number;

  @ManyToMany(() => Payment, payment => payment.invoices)
  payments: Payment[];

  @BeforeInsert()
  setInitialRemainingAmount() {
    this.remainingAmount = this.totalPayableAmount;
  }

  hasPayments(): boolean {
    return this.payments && this.payments.length > 0;
  }
}
