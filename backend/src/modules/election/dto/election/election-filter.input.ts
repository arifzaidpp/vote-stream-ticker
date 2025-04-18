import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

@InputType()
export class ElectionFilter {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  updatedAt?: Date;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}