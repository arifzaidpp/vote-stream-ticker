import { InputType, Field, ID } from '@nestjs/graphql';
import { CandidatePosition } from '../../enums/candidate-position.enum';

@InputType()
export class CreateCandidateInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  photo?: string;

  @Field(() => CandidatePosition)
  position: CandidatePosition;

  @Field(() => ID, { nullable: true })
  partyId?: string;
}