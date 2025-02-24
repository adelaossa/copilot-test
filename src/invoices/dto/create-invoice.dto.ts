import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsDate, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { InputType, Field, Float } from '@nestjs/graphql';
import { InvoiceItemDto } from './invoice-item.dto';

@InputType('CreateInvoiceInput')
export class CreateInvoiceDto {
  @Field()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => Float)
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalPayableAmount: number;

  @Field()
  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  dueDate: Date;

  @Field(() => [InvoiceItemDto])
  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Invoice must contain at least 1 item' })
  items: InvoiceItemDto[];
}
