// src/election/inputs/create-election.input.ts
import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

@InputType()
export class CreateElectionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  additionalInfo?: string;
}

// src/election/models/election.model.ts
import { ID } from '@nestjs/graphql';

@ObjectType()
export class Election {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  startDate: string;

  @Field()
  endDate: string;

  @Field({ nullable: true })
  additionalInfo?: string;

  @Field()
  createdById: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CandidateResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  photo?: string;

  @Field()
  position: string;
}

@ObjectType()
export class PartyResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  logo?: string;

  @Field()
  color: string;

  @Field(() => [CandidateResponse])
  candidates: CandidateResponse[];
}

@ObjectType()
export class BoothResponse {
  @Field()
  id: string;

  @Field()
  boothNumber: number;

  @Field()
  voterCount: number;

  @Field()
  totalVotesCounted: number;
}

@ObjectType()
export class ElectionResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  logo?: string;

  @Field()
  status: string;

  @Field()
  totalVoters: number;

  @Field()
  accessCode: string;

  @Field()
  votingCompletion: number;

  @Field(() => [BoothResponse])
  booths: BoothResponse[];

  @Field(() => [PartyResponse])
  parties: PartyResponse[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}