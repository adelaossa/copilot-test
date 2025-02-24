import { IsNumber, IsEnum, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';
import { PaymentDistributionType, ItemDistributionType } from '../types/payment-distribution.types';

export class CreatePaymentDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ type: [Number] })
  @IsArray()
  invoiceIds: number[];

  @ApiProperty({ enum: PaymentDistributionType })
  @IsEnum(PaymentDistributionType)
  distributionType: PaymentDistributionType;

  @ApiProperty({ enum: ItemDistributionType })
  @IsEnum(ItemDistributionType)
  itemDistributionType: ItemDistributionType;
}