import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateBoothInput {
  @Field()
  boothNumber: number;

  @Field()
  voterCount: number;

  @Field(() => String, { nullable: true })
  electionId?: string;
}