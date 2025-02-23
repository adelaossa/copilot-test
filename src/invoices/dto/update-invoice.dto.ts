import { ApiProperty } from '@nestjs/swagger';
import { InvoiceItemDto } from './invoice-item.dto';

export class UpdateInvoiceDto {
  @ApiProperty()
  description?: string;
  
  @ApiProperty()
  totalPayableAmount?: number;

  @ApiProperty()
  dueDate?: Date;

  
  @ApiProperty({ type: [InvoiceItemDto] })
  items?: InvoiceItemDto[];
}
