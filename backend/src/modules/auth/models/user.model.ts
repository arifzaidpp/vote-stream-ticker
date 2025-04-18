import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserProfile } from './user-profile.model';

/**
 * Enum for user verification status
 */
export enum VerificationStatus {
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
}

// /**
//  * Enum for user roles
//  */
// export enum UserRole {
//   ADMIN = 'ADMIN',
//   ELECTION_CONTROLLER = 'ELECTION_CONTROLLER',
//   VOTE_COUNTER = 'VOTE_COUNTER',
// }

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
     * User role
     */
  @Field(() => String, { nullable: true })
  role?: string | null;

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
}