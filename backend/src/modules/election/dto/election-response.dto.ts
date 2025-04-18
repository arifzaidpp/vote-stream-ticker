// src/election/dto/election-response.dto.ts
import { CandidatePosition } from './create-election.dto';

export class CandidateResponseDto {
  id: string;
  name: string;
  photo?: string;
  position: CandidatePosition;
}

export class PartyResponseDto {
  id: string;
  name: string;
  logo?: string;
  color: string;
  candidates: CandidateResponseDto[];
}

export class BoothResponseDto {
  id: string;
  boothNumber: number;
  voterCount: number;
  totalVotesCounted: number;
}

export class ElectionResponseDto {
  id: string;
  name: string;
  logo?: string;
  status: string;
  totalVoters: number;
  votingCompletion: number;
  booths: BoothResponseDto[];
  parties: PartyResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}