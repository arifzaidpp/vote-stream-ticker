import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

/**
 * User profile model for GraphQL
 */
@ObjectType()
export class UserProfile {
  /**
   * User ID this profile belongs to (primary key)
   */
  @Field(() => ID, { nullable: true })
  userId?: number | null;

  /**
   * User's full name
   */
  @Field(() => String, { nullable: true })
  fullName?: string | null;

  /**
   * URL to user's avatar/profile picture
   */
  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  /**
   * When the profile was created
   */
  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  /**
   * When the profile was last updated
   */
  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;
}
