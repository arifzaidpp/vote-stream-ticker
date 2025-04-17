import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class SetPasswordInput {
  @Field()
  password: string;
}