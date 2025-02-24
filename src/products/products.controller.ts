import { Controller, Get, Post, Body, Put, Param, Delete, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Roles, Unprotected } from 'nest-keycloak-connect';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);
  
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Unprotected()
  async findAll(): Promise<Product[]> {
    this.logger.debug('Finding all products - unprotected endpoint');
    return this.productsService.findAll();
  }

  @Get(':id')
  @Roles({ roles: ['user'] })
  findOne(@Param('id') id: number): Promise<Product> {
    this.logger.debug(`Finding product with id ${id} - requires user role`);
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles({ roles: ['admin'] })
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    this.logger.debug('Creating product - requires admin role');
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @Roles({ roles: ['admin'] })
  update(@Param('id') id: number, @Body() updateProductDto: Partial<CreateProductDto>): Promise<Product> {
    this.logger.debug(`Updating product ${id} - requires admin role`);
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles({ roles: ['admin'] })
  remove(@Param('id') id: number): Promise<void> {
    this.logger.debug(`Deleting product ${id} - requires admin role`);
    return this.productsService.remove(id);
  }
}