import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdatePartyInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  color?: string;
}