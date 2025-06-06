import { Field, ObjectType } from "@nestjs/graphql";
import { SuccessResponse } from "../../../common/models/pagination.model";
import { User } from "../models/user.model";

@ObjectType()
export class VerifyEmailResponse extends SuccessResponse {
  @Field(() => User)
  user: User;
}