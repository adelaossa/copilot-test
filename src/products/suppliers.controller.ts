import { Controller, Get, Post, Body, Put, Param, Delete, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { Roles, Unprotected } from 'nest-keycloak-connect';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  private readonly logger = new Logger(SuppliersController.name);
  
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @Unprotected()
  async findAll(): Promise<Supplier[]> {
    this.logger.debug('Finding all suppliers - unprotected endpoint');
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @Unprotected()
  findOne(@Param('id') id: number): Promise<Supplier> {
    this.logger.debug(`Finding supplier with id ${id} - public endpoint`);
    return this.suppliersService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['admin'] })
  create(@Body() createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    this.logger.debug('Creating supplier - requires admin role');
    return this.suppliersService.create(createSupplierDto);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['admin'] })
  update(@Param('id') id: number, @Body() updateSupplierDto: Partial<CreateSupplierDto>): Promise<Supplier> {
    this.logger.debug(`Updating supplier ${id} - requires admin role`);
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['admin'] })
  remove(@Param('id') id: number): Promise<void> {
    this.logger.debug(`Deleting supplier ${id} - requires admin role`);
    return this.suppliersService.remove(id);
  }
}