import { Field, InputType, PartialType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { CreateElectionDto } from './create-election.input';

@InputType()
export class UpdateCandidateDto {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  photo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  position?: string;
}

@InputType()
export class UpdatePartyDto {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  logo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => [UpdateCandidateDto], { nullable: true })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateCandidateDto)
  candidates?: UpdateCandidateDto[];
}

@InputType()
export class UpdateBoothDto {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  boothNumber?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  voterCount?: number;
}

@InputType()
export class UpdateElectionDto {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  logo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  totalVoters?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  accessCode?: string;

  @Field(() => [UpdateBoothDto], { nullable: true })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateBoothDto)
  booths?: UpdateBoothDto[];

  @Field(() => [UpdatePartyDto], { nullable: true })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdatePartyDto)
  parties?: UpdatePartyDto[];
}