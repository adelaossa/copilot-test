import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierInput } from './dto/update-supplier.dto';
import { Roles, Unprotected } from 'nest-keycloak-connect';

@Resolver(() => Supplier)
export class SuppliersResolver {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Query(() => [Supplier], { name: 'suppliers' })
  @Unprotected()
  findAll() {
    return this.suppliersService.findAll();
  }

  @Query(() => Supplier, { name: 'supplier' })
  @Unprotected()
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Mutation(() => Supplier)
  @Roles({ roles: ['admin'] })
  createSupplier(@Args('createSupplierInput', { type: () => CreateSupplierDto }) createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Mutation(() => Supplier)
  @Roles({ roles: ['admin'] })
  updateSupplier(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateSupplierInput', { type: () => UpdateSupplierInput }) updateSupplierDto: UpdateSupplierInput
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Mutation(() => Boolean)
  @Roles({ roles: ['admin'] })
  removeSupplier(@Args('id', { type: () => Int }) id: number) {
    this.suppliersService.remove(id);
    return true;
  }
}