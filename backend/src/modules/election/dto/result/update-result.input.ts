import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateResultInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  voteCount?: number;
}