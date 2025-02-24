import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InputType, Field, Float } from '@nestjs/graphql';

@InputType('CreateProductInput')
export class CreateProductDto {
  @Field()
  @ApiProperty()
  @IsString()
  name: string;

  @Field(() => Float)
  @ApiProperty()
  @IsNumber()
  @Min(0)
  currentPrice: number;

  @Field({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}