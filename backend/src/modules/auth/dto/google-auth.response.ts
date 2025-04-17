import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "../models/user.model";

@ObjectType()
export class GoogleAuthResponse {
  @Field(() => User)
  user: User;
  
  @Field(() => Boolean)
  isNewUser: boolean;
}