import { registerEnumType } from '@nestjs/graphql';

export enum CandidatePosition {
  PRESIDENT = 'PRESIDENT',
  SECRETARY = 'SECRETARY',
  TREASURER = 'TREASURER',
}

registerEnumType(CandidatePosition, {
  name: 'CandidatePosition',
  description: 'Position a candidate is running for',
});
