import { Controller, Get, Param, Delete, Post, Body, Put } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Roles, Unprotected } from 'nest-keycloak-connect';
import { Language } from '../i18n/decorators/language-header.decorator';

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
  findOne(@Param('id') id: number, @Language() lang: string): Promise<Invoice> {
    return this.invoicesService.findOne(id, lang);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['user'] })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Language() lang: string) {
    return this.invoicesService.create(createInvoiceDto, lang);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['admin'] })
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Language() lang: string
  ) {
    return this.invoicesService.update(+id, updateInvoiceDto, lang);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['admin'] })
  remove(@Param('id') id: number, @Language() lang: string): Promise<void> {
    return this.invoicesService.remove(id, lang);
  }
}
