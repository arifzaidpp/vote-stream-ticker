import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Admin } from './admin.model';
import { Role } from './role.model';

/**
 * Admin-Role relation model for GraphQL
 */
@ObjectType()
export class AdminRole {
  /**
   * Admin ID
   */
  @Field(() => ID)
  adminId: number;

  /**
   * Role ID
   */
  @Field(() => ID)
  roleId: number;

  /**
   * Optional end date for timed role assignments
   */
  @Field({ nullable: true })
  endDate?: Date;

  /**
   * When the role was assigned
   */
  @Field()
  assignedAt: Date;

  /**
   * ID of admin who assigned this role
   */
  @Field(() => ID, { nullable: true })
  assignedBy?: number;

  /**
   * Admin who has this role
   */
  @Field(() => Admin, { nullable: true })
  admin?: Admin;

  /**
   * The role that is assigned
   */
  @Field(() => Role, { nullable: true })
  role?: Role;

  /**
   * Admin who assigned this role
   */
  @Field(() => Admin, { nullable: true })
  assignedByAdmin?: Admin;
}