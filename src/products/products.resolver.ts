import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Roles, Unprotected } from 'nest-keycloak-connect';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => [Product])
  @Unprotected()
  products(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Query(() => Product)
  @Unprotected()
  product(@Args('id', { type: () => ID }) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Mutation(() => Product)
  @Roles({ roles: ['admin'] })
  createProduct(@Args('input') createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Mutation(() => Product)
  @Roles({ roles: ['admin'] })
  updateProduct(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') updateProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Mutation(() => Boolean)
  @Roles({ roles: ['admin'] })
  async removeProduct(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    await this.productsService.remove(id);
    return true;
  }
}