import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

/**
 * DTO for forgot password request
 */
@InputType()
export class ForgotPasswordDto {
  /**
   * User email address
   * @example "user@example.com"
   */
  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}