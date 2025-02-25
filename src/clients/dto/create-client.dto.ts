import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';

@InputType('CreateClientInput')
export class CreateClientDto {
  @Field()
  @ApiProperty()
  @IsString()
  name: string;

  @Field()
  @ApiProperty()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  taxId?: string;

  @Field({ nullable: true, defaultValue: true })
  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}