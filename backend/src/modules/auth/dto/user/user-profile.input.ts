import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

/**
 * DTO for user profile data
 */
@InputType()
export class UserProfileInput {
  /**
   * User's full name
   * @example "John Doe"
   */
  @Field({nullable: true})
  @IsString()
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  fullName: string;

  /**
   * URL to user's avatar/profile image (optional)
   * @example "https://example.com/avatar.jpg"
   */
  @Field({
    nullable: true,
    description: 'URL to user avatar/profile image',
  })
  @IsOptional()
  @IsUrl(undefined, { message: 'Avatar URL must be a valid URL' })
  @MaxLength(500, { message: 'Avatar URL is too long' })
  avatarUrl?: string;
}


@InputType()
export class UpdateProfileInput extends PartialType(UserProfileInput) {}


