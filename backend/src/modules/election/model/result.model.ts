import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CountingRound } from './counting-round.model';
import { Candidate } from './candidate.model';

@ObjectType()
export class Result {
  @Field(() => ID)
  id: string;

  @Field(() => CountingRound)
  countingRound: CountingRound;

  @Field()
  roundId: string;

  @Field(() => Candidate)
  candidate: Candidate;

  @Field()
  candidateId: string;

  @Field()
  voteCount: number;

  @Field()
  countedAt: Date;
}