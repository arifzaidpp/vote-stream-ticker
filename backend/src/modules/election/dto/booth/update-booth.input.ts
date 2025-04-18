import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateBoothInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  boothNumber?: number;

  @Field({ nullable: true })
  voterCount?: number;

  @Field({ nullable: true })
  totalVotesCounted?: number;
}