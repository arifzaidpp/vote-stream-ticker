import { Field, ObjectType } from '@nestjs/graphql';
import { ElectionResponse } from './election.model';

@ObjectType()
export class ElectionPaginated {
  @Field(() => [ElectionResponse])
  items: ElectionResponse[];

  @Field(() => Number)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}