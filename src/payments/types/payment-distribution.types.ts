export enum PaymentDistributionType {
  PROPORTIONAL = 'proportional',
  OLDEST_FIRST = 'oldest_first'
}

export enum ItemDistributionType {
  PROPORTIONAL = 'proportional',
  IN_ORDER = 'in_order'
}

export interface InvoiceItemPaymentApplication {
  itemId: number;
  appliedAmount: number;
}

export interface InvoicePaymentApplication {
  invoiceId: number;
  appliedAmount: number;
  itemDistributions: InvoiceItemPaymentApplication[];
}