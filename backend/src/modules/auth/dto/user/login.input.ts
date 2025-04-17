import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO for user login
 */
@InputType()
export class LoginDto {
  /**
   * User email address
   * @example "user@example.com"
   */
  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  /**
   * User password
   * @example "P@ssw0rd123"
   */
  @Field()
  @IsString()
  @MinLength(1, { message: 'Password cannot be empty' })
  password: string;
}