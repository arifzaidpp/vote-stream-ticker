import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserProfile } from './user-profile.model';
import { UserPreferences } from './user-preferences.model';

/**
 * Enum for user verification status
 */
export enum VerificationStatus {
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
}

// Register enum for GraphQL schema
registerEnumType(VerificationStatus, {
  name: 'VerificationStatus',
  description: 'User verification status',
});

/**
 * User model for GraphQL
 */
@ObjectType()
export class User {
  /**
   * Unique user ID
   */
  @Field(() => ID, { nullable: true })
  id?: number | null;

  /**
   * User email address
   */
  @Field(() => String, { nullable: true })
  email?: string | null;

  /**
   * Whether the user has premium subscription
   */
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isPremium?: boolean | null;

  /**
   * Whether the user has premium plus subscription
   */
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isPremiumPlus?: boolean | null;

  /**
   * Whether the user is an author
   */
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isAuthor?: boolean | null;

  /**
   * Optional Google ID for OAuth users
   */
  @Field(() => String, { nullable: true })
  googleId?: string | null;

  /**
   * When the user was created
   */
  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  /**
   * User profile information
   */
  @Field(() => UserProfile, { nullable: true })
  profile?: UserProfile | null;

  /**
   * User preferences
   */
  @Field(() => UserPreferences, { nullable: true })
  preferences?: UserPreferences | null;
}
