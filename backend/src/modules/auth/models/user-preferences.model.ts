import { Field, ID, ObjectType } from '@nestjs/graphql';

/**
 * User preferences model for GraphQL
 */
@ObjectType()
export class UserPreferences {
  /**
   * User ID these preferences belong to (primary key)
   */
  @Field(() => ID)
  userId: number;

  /**
   * Whether dark mode is enabled
   */
  @Field(() => Boolean)
  darkModeEnabled: boolean;

  /**
   * Whether to receive emails about new packets/issues
   */
  @Field(() => Boolean)
  packetEmailEnabled: boolean;

  /**
   * Whether to receive emails about user engagement (comments, reactions)
   */
  @Field(() => Boolean)
  engagementEmailEnabled: boolean;

  /**
   * When the preferences were created
   */
  @Field()
  createdAt: Date;

  /**
   * When the preferences were last updated
   */
  @Field()
  updatedAt: Date;
}