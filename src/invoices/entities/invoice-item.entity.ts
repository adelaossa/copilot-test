import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Invoice } from './invoice.entity';
import { Product } from '../../products/entities/product.entity';

@ObjectType()
@Entity()
export class InvoiceItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  quantity: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  remainingAmount: number;

  @Field(() => Invoice)
  @ManyToOne(() => Invoice, invoice => invoice.items)
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ name: 'invoiceId' })
  invoiceId: number;

  @Field(() => Product)
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
