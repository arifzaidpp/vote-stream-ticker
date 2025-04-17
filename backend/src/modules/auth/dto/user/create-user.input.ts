import { IsEmail, IsString, IsOptional, MinLength, MaxLength, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserProfileInput } from './user-profile.input';
import { Field, InputType } from '@nestjs/graphql';

/**
 * DTO for user registration
 */
@InputType()
export class CreateUserDto {
  /**
   * User email address
   * @example "user@example.com"
   */
  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  /**
   * User password
   * Requires minimum 8 characters, at least one uppercase letter, 
   * one lowercase letter, one number, and one special character.
   * @example "P@ssw0rd123"
   */
  @Field()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password is too long' })
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    { message: 'Password must include at least one letter and one number' }
  )  
  password: string;
 
  /**
   * User profile information (optional)
   */
  @Field(() => UserProfileInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserProfileInput)
  profile?: UserProfileInput;
}