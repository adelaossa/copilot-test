import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  totalPayableAmount: number;

  @Column()
  dueDate: Date;

  @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: true })
  items: InvoiceItem[];
}
