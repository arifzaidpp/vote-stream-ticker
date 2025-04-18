import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateCountingRoundInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  isPublished?: boolean;
}