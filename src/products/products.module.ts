import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductsSeeder } from './products.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService, ProductsSeeder],
  controllers: [ProductsController],
  exports: [ProductsService, ProductsSeeder],
})
export class ProductsModule {}