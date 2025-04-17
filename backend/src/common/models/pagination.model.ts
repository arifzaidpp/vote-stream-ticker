import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

// Define a generic interface for paginated responses
export interface PaginatedType<T> {
  items: T[];      // The array of items for the current page
  total: number;   // Total count of all items across all pages
  hasMore: boolean; // Whether there are more items available
}

// A generic function to create type-safe paginated response classes
export function Paginated<T>(classRef: Type<T>): Type<PaginatedType<T>> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponse implements PaginatedType<T> {
    @Field(() => [classRef])
    items: T[];

    @Field(() => Int)
    total: number;

    @Field(() => Boolean)
    hasMore: boolean;
  }

  return PaginatedResponse as Type<PaginatedType<T>>;
}

// A simple success response object
@ObjectType()
export class SuccessResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

// A response containing just a count
@ObjectType()
export class CountResponse {
  @Field(() => Int)
  count: number;
}

// A response containing just an ID
@ObjectType()
export class IdResponse {
  @Field(() => Int)
  id: number;
}

