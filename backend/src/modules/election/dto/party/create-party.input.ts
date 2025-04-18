import { InputType, Field, ID } from '@nestjs/graphql';
import { CreateCandidateInput } from '../candidate/create-candidate.input';

@InputType()
export class CreatePartyInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  logo?: string;

  @Field()
  color: string;

  @Field(() => ID, { nullable: true })
  electionId?: string;

  @Field(() => [CreateCandidateInput], { nullable: true })
  candidates?: CreateCandidateInput[];
}