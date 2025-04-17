import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Admin } from './admin.model';

/**
 * Admin session model for GraphQL
 */
@ObjectType()
export class AdminSession {
  /**
   * Unique session ID
   */
  @Field(() => ID)
  id: string;

  /**
   * Admin ID this session belongs to
   */
  @Field(() => ID)
  adminId: number;

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
   * Admin associated with this session
   */
  @Field(() => Admin, { nullable: true })
  admin?: Admin;
}