import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsSeeder {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async seed(count: number = 50) {
    // Check if products already exist
    const existingCount = await this.productsRepository.count();
    if (existingCount > 0) {
      console.log('⏩ Products already exist, skipping seeding');
      return;
    }
    
    console.log('🌱 Seeding products...');
    
    const products = Array.from({ length: count }, () => {
      const product = new Product();
      product.name = faker.commerce.productName();
      product.description = faker.commerce.productDescription();
      product.currentPrice = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
      return product;
    });

    await this.productsRepository.save(products);
    console.log(`✅ Successfully seeded ${count} products`);
  }

  async clear() {
    await this.productsRepository.clear();
    console.log('🧹 Cleared all products');
  }
}