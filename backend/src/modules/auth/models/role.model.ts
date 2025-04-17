import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Admin } from './admin.model';

/**
 * Role model for GraphQL
 */
@ObjectType()
export class Role {
  /**
   * Unique role ID
   */
  @Field(() => ID)
  id: number;

  /**
   * Role name
   */
  @Field()
  name: string;

  /**
   * Role description
   */
  @Field()
  description: string;

  /**
   * Permissions granted by this role
   */
  @Field(() => [String])
  permissions: string[];

  /**
   * When the role was created
   */
  @Field()
  createdAt: Date;

  /**
   * When the role was last updated
   */
  @Field()
  updatedAt: Date;

  /**
   * Admins with this role
   */
  @Field(() => [Admin], { nullable: true })
  admins?: Admin[];
}