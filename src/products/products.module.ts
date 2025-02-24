import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductsSeeder } from './products.seeder';
import { ProductsResolver } from './products.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    AuthModule
  ],
  providers: [ProductsService, ProductsSeeder, ProductsResolver],
  controllers: [ProductsController],
  exports: [ProductsService, ProductsSeeder],
})
export class ProductsModule {}