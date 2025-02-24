import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';
import { InputType, Field, Float } from '@nestjs/graphql';

@InputType('InvoiceItemInput')
export class InvoiceItemDto {
  @Field()
  @ApiProperty()
  @IsString()
  description: string;

  @Field()
  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @Field(() => Float)
  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @Field(() => Float)
  @ApiProperty()
  @IsNumber()
  @Min(0)
  total: number;

  @Field()
  @ApiProperty()
  @IsNumber()
  productId: number;
}
