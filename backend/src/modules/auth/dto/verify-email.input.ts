import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for email verification
 */
@InputType()
export class VerifyEmailDto {
  /**
   * Email verification token
   * @example "a1b2c3d4e5f6g7h8i9j0"
   */
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Verification token is required' })
  token: string;
}