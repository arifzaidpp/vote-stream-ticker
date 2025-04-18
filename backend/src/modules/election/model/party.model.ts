import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Election } from './election.model';
import { Candidate } from './candidate.model';

@ObjectType()
export class Party {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  logo?: string;

  @Field()
  color: string;

  @Field(() => Election)
  election: Election;

  @Field()
  electionId: string;

  @Field(() => [Candidate], { nullable: true })
  candidates?: Candidate[];
}