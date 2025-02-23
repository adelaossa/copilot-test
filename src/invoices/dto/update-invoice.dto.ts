import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { InvoiceItemDto } from './invoice-item.dto';

export class UpdateInvoiceDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
  
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  totalPayableAmount?: number;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : value)
  dueDate?: Date;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'If items are provided, at least 1 item is required' })
  items?: InvoiceItemDto[];
}
