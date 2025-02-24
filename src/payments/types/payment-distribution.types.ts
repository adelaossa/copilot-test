import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum PaymentDistributionType {
  PROPORTIONAL = 'proportional',
  OLDEST_FIRST = 'oldest_first'
}

export enum ItemDistributionType {
  PROPORTIONAL = 'proportional',
  IN_ORDER = 'in_order'
}

registerEnumType(PaymentDistributionType, {
  name: 'PaymentDistributionType',
});

registerEnumType(ItemDistributionType, {
  name: 'ItemDistributionType',
});

@ObjectType()
export class InvoiceItemPaymentApplication {
  @Field(() => Int)
  itemId: number;
  
  @Field(() => Float)
  appliedAmount: number;
}

@ObjectType()
export class InvoicePaymentApplication {
  @Field(() => Int)
  invoiceId: number;
  
  @Field(() => Float)
  appliedAmount: number;
  
  @Field(() => [InvoiceItemPaymentApplication])
  itemDistributions: InvoiceItemPaymentApplication[];
}