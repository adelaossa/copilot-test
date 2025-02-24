import { IsNumber, IsEnum, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { PaymentMethod } from '../entities/payment.entity';
import { PaymentDistributionType, ItemDistributionType } from '../types/payment-distribution.types';

@InputType('CreatePaymentInput')
export class CreatePaymentDto {
  @Field(() => Float)
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field(() => PaymentMethod)
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @Field(() => [Int])
  @ApiProperty({ type: [Number] })
  @IsArray()
  invoiceIds: number[];

  @Field(() => PaymentDistributionType)
  @ApiProperty({ enum: PaymentDistributionType })
  @IsEnum(PaymentDistributionType)
  distributionType: PaymentDistributionType;

  @Field(() => ItemDistributionType)
  @ApiProperty({ enum: ItemDistributionType })
  @IsEnum(ItemDistributionType)
  itemDistributionType: ItemDistributionType;
}