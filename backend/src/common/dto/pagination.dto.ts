import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  skip?: number = 0;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  take?: number = 10;
}

@InputType()
export class PaginationWithSearchInput extends PaginationInput {
  @Field({ nullable: true })
  @IsOptional()
  search?: string;
}
