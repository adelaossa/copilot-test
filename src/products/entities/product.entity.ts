import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Supplier } from './supplier.entity';

@ObjectType()
@Entity()
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  currentPrice: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => Supplier, { nullable: true })
  @ManyToOne(() => Supplier, supplier => supplier.products, { nullable: true })
  supplier: Supplier;

  @Field({ nullable: true })
  @Column({ nullable: true })
  supplierId: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}