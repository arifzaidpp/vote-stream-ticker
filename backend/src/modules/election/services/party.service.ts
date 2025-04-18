// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/shared/prisma/prisma.service';
// import { Party } from '../model/party.model';
// import { CreatePartyInput } from '../dto/party/create-party.input';
// import { UpdatePartyInput } from '../dto/party/update-party.input';


// @Injectable()
// export class PartyService {
//   constructor(private prisma: PrismaService) {}

//   async create(data: CreatePartyInput): Promise<Party> {
//     const { candidates, ...partyData } = data;
    
//     return this.prisma.party.create({
//       data: {
//         ...partyData,
//         candidates: candidates ? {
//           create: candidates
//         } : undefined
//       },
//       include: {
//         election: true,
//         candidates: true
//       }
//     });
//   }

//   async findAll(): Promise<Party[]> {
//     return this.prisma.party.findMany({
//       include: {
//         election: true,
//         candidates: true
//       }
//     });
//   }

//   async findByElection(electionId: string): Promise<Party[]> {
//     return this.prisma.party.findMany({
//       where: { electionId },
//       include: {
//         election: true,
//         candidates: true
//       }
//     });
//   }

//   async findOne(id: string): Promise<Party | null> {
//     return this.prisma.party.findUnique({
//       where: { id },
//       include: {
//         election: true,
//         candidates: true
//       }
//     });
//   }

//   async update(data: UpdatePartyInput): Promise<Party> {
//     const { id, ...updateData } = data;
//     return this.prisma.party.update({
//       where: { id },
//       data: updateData,
//       include: {
//         election: true,
//         candidates: true
//       }
//     });
//   }

//   async remove(id: string): Promise<Party> {
//     return this.prisma.party.delete({
//       where: { id },
//       include: {
//         election: true,
//         candidates: true
//       }
//     });
//   }
// }