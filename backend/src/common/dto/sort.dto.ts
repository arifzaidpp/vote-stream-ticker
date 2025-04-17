import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationWithSearchInput } from './pagination.dto';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Sort direction',
});

@InputType()
export class SortInput {
  @Field(() => String , { nullable: true })
  @IsOptional()
  field?: string;

  @Field(() => SortDirection, { defaultValue: SortDirection.DESC })
  @IsEnum(SortDirection)
  @IsOptional()
  direction?: SortDirection = SortDirection.DESC;
}


@InputType()
 export class PaginationWithSortInput extends PaginationWithSearchInput {
   @Field(() => String , { nullable: true })
    @IsOptional()
    field?: string;
  
    @Field(() => SortDirection, { defaultValue: SortDirection.DESC })
    @IsEnum(SortDirection)
    @IsOptional()
    direction?: SortDirection = SortDirection.DESC;
 }