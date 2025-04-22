// src/counting/dto/submit-vote-count.dto.ts
import { IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class VoteResultDto {
  @IsString()
  candidateId: string;
  
  @IsNumber()
  @Min(0)
  voteCount: number; //string needed
}

export class SubmitVoteCountDto {
  @IsString()
  electionId: string;
  
  @IsString()
  boothId: string;
  
  @IsNumber()
  roundNumber: number;

  @IsNumber()
  @Min(1)
  voteValue: number; //string needed
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoteResultDto)
  results: VoteResultDto[];
}