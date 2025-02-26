import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Supplier } from './entities/supplier.entity';
import { ProductsSeeder } from './products.seeder';
import { ProductsResolver } from './products.resolver';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { SuppliersResolver } from './suppliers.resolver';
import { SuppliersSeeder } from './suppliers.seeder';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Supplier]),
    AuthModule
  ],
  providers: [
    ProductsService, 
    ProductsSeeder, 
    ProductsResolver,
    SuppliersService,
    SuppliersResolver,
    SuppliersSeeder
  ],
  controllers: [ProductsController, SuppliersController],
  exports: [ProductsService, ProductsSeeder, SuppliersService, SuppliersSeeder],
})
export class ProductsModule {}