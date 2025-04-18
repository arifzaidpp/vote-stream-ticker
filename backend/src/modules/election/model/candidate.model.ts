import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Party } from './party.model';
import { Result } from './result.model';
import { CandidatePosition } from '../enums/candidate-position.enum';

@ObjectType()
export class Candidate {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  photo?: string;

  @Field(() => CandidatePosition)
  position: CandidatePosition;

  @Field(() => Party)
  party: Party;

  @Field()
  partyId: string;

  @Field(() => [Result], { nullable: true })
  results?: Result[];
}