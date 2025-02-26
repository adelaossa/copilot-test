import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateSupplierDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  contactPerson: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  address: string;
}