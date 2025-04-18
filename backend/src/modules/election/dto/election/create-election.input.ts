import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

@InputType()
class BoothDto {
  @Field()
  @IsNumber()
  boothNumber: number;

  @Field()
  @IsNumber()
  voterCount: number;
}

@InputType()
class CandidateDto {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  photo?: string;

  @Field()
  @IsString()
  position: string;
}

@InputType()
class PartyDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsUrl()
  logo: string;

  @Field()
  @IsString()
  color: string;

  @Field(() => [CandidateDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateDto)
  candidates: CandidateDto[];
}

@InputType()
export class CreateElectionDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsUrl()
  logo: string;

  @Field()
  @IsString()
  status: string;

  @Field()
  @IsNumber()
  totalVoters: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accessCode?: string;

  @Field(() => [BoothDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoothDto)
  booths: BoothDto[];

  @Field(() => [PartyDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartyDto)
  parties: PartyDto[];
}