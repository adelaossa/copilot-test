import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard, ResourceGuard, RoleGuard, Roles, Unprotected } from 'nest-keycloak-connect';

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
  @UseGuards(AuthGuard, ResourceGuard, RoleGuard)
  @Roles({ roles: ['admin'] })
  createPayment(@Args('input') createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsService.createPayment(createPaymentDto);
  }
}