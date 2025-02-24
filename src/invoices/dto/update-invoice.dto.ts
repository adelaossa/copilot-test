import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { InputType, Field, Float } from '@nestjs/graphql';
import { InvoiceItemDto } from './invoice-item.dto';

@InputType('UpdateInvoiceInput')
export class UpdateInvoiceDto {
  @Field({ nullable: true })
  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
  
  @Field(() => Float, { nullable: true })
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  totalPayableAmount?: number;

  @Field({ nullable: true })
  @ApiProperty()
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : value)
  dueDate?: Date;

  @Field(() => [InvoiceItemDto], { nullable: true })
  @ApiProperty({ type: [InvoiceItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'If items are provided, at least 1 item is required' })
  items?: InvoiceItemDto[];
}
