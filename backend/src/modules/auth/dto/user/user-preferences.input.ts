import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO for user preferences data
 */
@InputType()
export class UserPreferencesDto {
  /**
   * Whether dark mode is enabled
   * @default false
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  darkModeEnabled?: boolean;

  /**
   * Whether to receive email notifications about new packets
   * @default true
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  packetEmailEnabled?: boolean;

  /**
   * Whether to receive email notifications about engagements (comments, reactions)
   * @default true
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  engagementEmailEnabled?: boolean;
}

@InputType()
export class UpdatePreferencesInput extends UserPreferencesDto {}