// src/election/dto/create-election.dto.ts
import { IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export enum CandidatePosition {
  PRESIDENT = 'PRESIDENT',
  SECRETARY = 'SECRETARY',
  TREASURER = 'TREASURER',
}

export class CreateCandidateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsEnum(CandidatePosition)
  position: CandidatePosition;
}

export class CreatePartyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsString()
  color: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCandidateDto)
  candidates?: CreateCandidateDto[];
}

export class CreateBoothDto {
  @IsNumber()
  @IsPositive()
  boothNumber: number;

  @IsNumber()
  @IsPositive()
  voterCount: number;
}

export class CreateElectionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBoothDto)
  booths?: CreateBoothDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePartyDto)
  parties?: CreatePartyDto[];
}