import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

/**
 * DTO for Google OAuth authentication
 */
@InputType()
export class GoogleAuthDto {
  /**
   * Google user ID
   * @example "115366005952267157475"
   */
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Google ID is required' })
  googleId: string;

  /**
   * User email address from Google
   * @example "user@gmail.com"
   */
  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  /**
   * User's first name from Google profile
   * @example "John"
   */
  @Field({
    nullable: true,
    description: 'User first name from Google profile',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  /**
   * User's last name from Google profile
   * @example "Doe"
   */
  @Field({
    nullable: true,
    description: 'User last name from Google profile',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  /**
   * URL to user's Google profile picture
   * @example "https://lh3.googleusercontent.com/a/profile-picture"
   */
  @Field({
    nullable: true,
    description: 'URL to user profile picture from Google',
  })
  @IsOptional()
  @IsUrl(undefined, { message: 'Profile picture URL must be a valid URL' })
  picture?: string;
}