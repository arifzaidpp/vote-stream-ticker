import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../models/user.model';

@ObjectType()
export class LoginResponse {
  @Field(() => User)
  user: User;
}
