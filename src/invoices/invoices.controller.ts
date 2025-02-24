import { Controller, Get, Param, Delete, Post, Body, Put } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Roles, Unprotected } from 'nest-keycloak-connect';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Unprotected()
  findAll(): Promise<Invoice[]> {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @Unprotected()
  findOne(@Param('id') id: number): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['user'] })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['admin'] })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(+id, updateInvoiceDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['admin'] })
  remove(@Param('id') id: number): Promise<void> {
    return this.invoicesService.remove(id);
  }
}
