import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Roles, Unprotected } from 'nest-keycloak-connect';

@Resolver(() => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Query(() => [Payment])
  @Unprotected()
  payments(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }

  @Query(() => Payment)
  @Unprotected()
  payment(@Args('id', { type: () => ID }) id: number): Promise<Payment> {
    return this.paymentsService.findOne(id);
  }

  @Mutation(() => Payment)
  @Roles({ roles: ['admin'] })
  createPayment(@Args('input') createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsService.createPayment(createPaymentDto);
  }
}