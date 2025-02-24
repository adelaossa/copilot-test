import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { AuthGuard, ResourceGuard, RoleGuard, Roles, Unprotected } from 'nest-keycloak-connect';

@Resolver(() => Invoice)
export class InvoicesResolver {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Query(() => [Invoice])
  @Unprotected()
  invoices(): Promise<Invoice[]> {
    return this.invoicesService.findAll();
  }

  @Query(() => Invoice)
  @Unprotected()
  invoice(@Args('id', { type: () => ID }) id: number): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Mutation(() => Invoice)
  @UseGuards(AuthGuard, ResourceGuard, RoleGuard)
  @Roles({ roles: ['user'] })
  createInvoice(@Args('input') createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Mutation(() => Invoice)
  @UseGuards(AuthGuard, ResourceGuard, RoleGuard)
  @Roles({ roles: ['admin'] })
  updateInvoice(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard, ResourceGuard, RoleGuard)
  @Roles({ roles: ['admin'] })
  async removeInvoice(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    await this.invoicesService.remove(id);
    return true;
  }
}