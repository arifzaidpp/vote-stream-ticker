import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Election } from './election.model';
import { CountingRound } from './counting-round.model';

@ObjectType()
export class Booth {
  @Field(() => ID)
  id: string;

  @Field()
  boothNumber: number;

  @Field()
  voterCount: number;

  @Field(() => Election)
  election: Election;

  @Field()
  electionId: string;

  @Field(() => [CountingRound], { nullable: true })
  countingRounds?: CountingRound[];

  @Field(() => Number, { defaultValue: 0 })
  totalVotesCounted: number;
}