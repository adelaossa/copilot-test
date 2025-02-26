import { CreateSupplierDto } from './create-supplier.dto';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class UpdateSupplierInput extends PartialType(CreateSupplierDto) {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}