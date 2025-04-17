import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

/**
 * Session model for GraphQL
 */
@ObjectType()
export class Session {
  /**
   * Unique session ID
   */
  @Field(() => ID)
  id: string;

  /**
   * User ID this session belongs to
   */
  @Field(() => ID)
  userId: number;

  /**
   * When the session expires
   */
  @Field()
  expires: Date;

  /**
   * IP address that created this session
   */
  @Field({ nullable: true })
  ipAddress?: string;

  /**
   * User agent that created this session
   */
  @Field({ nullable: true })
  userAgent?: string;

  /**
   * Device name/type that created this session
   */
  @Field({ nullable: true })
  deviceName?: string;

  /**
   * Authentication method used
   */
  @Field()
  loginMethod: string;

  /**
   * When the session was created
   */
  @Field()
  createdAt: Date;

  /**
   * When the session was last active
   */
  @Field({ nullable: true })
  lastActiveAt?: Date;

  /**
   * User associated with this session
   */
  @Field(() => User, { nullable: true })
  user?: User;
}