import { Field, ID, ObjectType, InputType } from '@nestjs/graphql';
import { Role } from './role.model';

/**
 * Admin model for GraphQL
 */
@ObjectType()
export class Admin {
  /**
   * Unique admin ID
   */
  @Field(() => ID)
  id: number;

  /**
   * Admin username
   */
  @Field()
  username: string;

  /**
   * Admin email address
   */
  @Field()
  email: string;

  /**
   * Admin full name
   */
  @Field()
  fullName: string;

  /**
   * URL to admin's image/avatar
   */
  @Field(() => String, { nullable: true })
  imageUrl?: string | null;

  /**
   * Admin's date of birth
   */
  @Field(() => Date, { nullable: true })
  dob?: Date | null;

  /**
   * Whether the admin account is active
   */
  @Field(() => Boolean)
  isActive: boolean;

  /**
   * Optional physical address
   */
  @Field(() => String, { nullable: true })
  address?: string | null;

  /**
   * Optional guardian name
   */
  @Field(() => String, { nullable: true })
  guardianName?: string | null;

  /**
   * Phone number
   */
  @Field(() => String, { nullable: true })
  phoneNumber?: string | null;

  /**
   * Alternate phone number
   */
  @Field(() => String, { nullable: true })
  alternatePhoneNumber?: string | null;

  /**
   * When the admin joined
   */
  @Field()
  joinedAt: Date;

  /**
   * When the admin account was created
   */
  @Field()
  createdAt: Date;

  /**
   * When the admin account was last updated
   */
  @Field()
  updatedAt: Date;

  /**
   * Roles assigned to this admin
   */
  @Field(() => [Role], { nullable: true })
  roles?: Role[];
}

@InputType()
export class UpdateAdminInput {
  @Field(() => String, { nullable: true })
  username?: string;
  
  @Field(() => String, { nullable: true })
  email?: string;
  
  @Field(() => String, { nullable: true })
  imageUrl?: string;
  
  @Field(() => Date, { nullable: true })
  dob?: Date;
  
  @Field(() => String, { nullable: true })
  address?: string;
  
  @Field(() => String, { nullable: true })
  guardianName?: string;
  
  @Field(() => String, { nullable: true })
  phoneNumber?: string;
  
  @Field(() => String, { nullable: true })
  alternatePhoneNumber?: string;
}