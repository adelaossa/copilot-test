import { ApiProperty } from '@nestjs/swagger';

export class InvoiceItemDto {
  @ApiProperty()
  description: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  total: number;
}
