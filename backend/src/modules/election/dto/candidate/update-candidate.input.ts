import { InputType, Field, ID } from '@nestjs/graphql';
import { CandidatePosition } from '../../enums/candidate-position.enum';

@InputType()
export class UpdateCandidateInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  photo?: string;

  @Field(() => CandidatePosition, { nullable: true })
  position?: CandidatePosition;
}