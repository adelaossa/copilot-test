import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Roles, Unprotected } from 'nest-keycloak-connect';
import { GqlContext } from '../shared/interfaces/graphql-context.interface';

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
  invoice(
    @Args('id', { type: () => ID }) id: number,
    @Context() context: GqlContext
  ): Promise<Invoice> {
    const lang = this.extractLanguage(context);
    return this.invoicesService.findOne(id, lang);
  }

  @Mutation(() => Invoice)
  @Roles({ roles: ['user'] })
  createInvoice(
    @Args('input') createInvoiceDto: CreateInvoiceDto,
    @Context() context: GqlContext
  ): Promise<Invoice> {
    const lang = this.extractLanguage(context);
    return this.invoicesService.create(createInvoiceDto, lang);
  }

  @Mutation(() => Invoice)
  @Roles({ roles: ['admin'] })
  updateInvoice(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') updateInvoiceDto: UpdateInvoiceDto,
    @Context() context: GqlContext
  ): Promise<Invoice> {
    const lang = this.extractLanguage(context);
    return this.invoicesService.update(id, updateInvoiceDto, lang);
  }

  @Mutation(() => Boolean)
  @Roles({ roles: ['admin'] })
  async removeInvoice(
    @Args('id', { type: () => ID }) id: number,
    @Context() context: GqlContext
  ): Promise<boolean> {
    const lang = this.extractLanguage(context);
    await this.invoicesService.remove(id, lang);
    return true;
  }

  private extractLanguage(context: GqlContext): string {
    const acceptLanguage = context.req.headers['accept-language'];
    if (!acceptLanguage) return 'en';
    
    const primaryLang = acceptLanguage.split(',')[0].trim().split('-')[0];
    return ['en', 'es'].includes(primaryLang) ? primaryLang : 'en';
  }
}