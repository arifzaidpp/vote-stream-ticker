import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateResultInput {
  @Field(() => ID, { nullable: true })
  roundId?: string;

  @Field(() => ID)
  candidateId: string;

  @Field()
  voteCount: number;
}