import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@ObjectType()
@Entity()
export class Supplier {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  contactPerson: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  phone: string;

  @Field()
  @Column()
  address: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field(() => [Product])
  @OneToMany(() => Product, product => product.supplier)
  products: Product[];

  @Field()
  @Column()
  createdAt: Date;

  @Field()
  @Column()
  updatedAt: Date;
}