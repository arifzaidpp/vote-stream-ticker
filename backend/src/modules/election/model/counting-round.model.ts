import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Booth } from './booth.model';
import { Result } from './result.model';

@ObjectType()
export class CountingRound {
  @Field(() => ID)
  id: string;

  @Field()
  roundNumber: number;

  @Field(() => Booth)
  booth: Booth;

  @Field()
  boothId: string;

  @Field()
  isPublished: boolean;

  @Field(() => [Result], { nullable: true })
  results?: Result[];

  @Field()
  createdAt: Date;
}