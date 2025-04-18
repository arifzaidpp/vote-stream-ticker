import { registerEnumType } from '@nestjs/graphql';

export enum ElectionStatus {
  DRAFT = 'DRAFT',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

registerEnumType(ElectionStatus, {
  name: 'ElectionStatus',
  description: 'Status of an election',
});