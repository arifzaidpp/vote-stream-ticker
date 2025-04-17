import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO for password reset
 */
@InputType()
export class ResetPasswordDto {
  /**
   * Password reset token
   * @example "a1b2c3d4e5f6g7h8i9j0"
   */
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  /**
   * New password
   * Requires minimum 8 characters, at least one uppercase letter, 
   * one lowercase letter, one number, and one special character.
   * @example "NewP@ssw0rd123"
   */
  @Field()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password is too long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  password: string;
}