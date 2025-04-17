import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from './user.model';

/**
 * Enum for token types
 */
export enum TokenType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

// Register enum for GraphQL schema
registerEnumType(TokenType, {
  name: 'TokenType',
  description: 'Type of verification token',
});

/**
 * Verification token model for GraphQL
 * 
 * Note: This model needs to be created in your Prisma schema
 * since it's not in the provided schema definition
 */
@ObjectType()
export class VerificationToken {
  /**
   * Unique token ID
   */
  @Field(() => ID)
  id: number;

  /**
   * User ID this token belongs to
   */
  @Field(() => ID)
  userId: number;

  /**
   * The token string used for verification
   */
  @Field()
  token: string;

  /**
   * When the token expires
   */
  @Field()
  expires: Date;

  /**
   * Type of verification token
   */
  @Field(() => TokenType)
  type: TokenType;

  /**
   * When the token was created
   */
  @Field()
  createdAt: Date;

  /**
   * User associated with this token
   */
  @Field(() => User, { nullable: true })
  user?: User;
}