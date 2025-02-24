import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('decimal', { precision: 10, scale: 2 })
  remainingAmount: number;

  @ManyToOne(() => Invoice, invoice => invoice.items)
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ name: 'invoiceId' })
  invoiceId: number;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ name: 'productId' })
  productId: number;

  @BeforeInsert()
  setInitialRemainingAmount() {
    this.remainingAmount = this.total;
  }
}
