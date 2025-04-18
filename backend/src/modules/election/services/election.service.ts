// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/shared/prisma/prisma.service';
// import { CreateElectionInput } from '../dto/election/create-election.input';
// import { Election } from '../model/election.model';
// import { UpdateElectionInput } from '../dto/election/update-election.input';


// @Injectable()
// export class ElectionService {
//   constructor(private prisma: PrismaService) {}

//   async create(data: CreateElectionInput): Promise<Election> {
//     const { booths, parties, ...electionData } = data;

//     return this.prisma.election.create({
//       data: {
//         ...electionData,
//         booths: booths ? {
//           create: booths
//         } : undefined,
//         parties: parties ? {
//           create: parties.map(party => {
//             const { candidates, ...partyData } = party;
//             return {
//               ...partyData,
//               candidates: candidates ? {
//                 create: candidates
//               } : undefined
//             };
//           })
//         } : undefined
//       },
//       include: {
//         booths: true,
//         parties: {
//           include: {
//             candidates: true
//           }
//         },
//         users: true
//       }
//     });
//   }

//   async findAll(): Promise<Election[]> {
//     return this.prisma.election.findMany({
//       include: {
//         booths: true,
//         parties: {
//           include: {
//             candidates: true
//           }
//         },
//         users: true
//       }
//     });
//   }

//   async findOne(id: string): Promise<Election | null> {
//     return this.prisma.election.findUnique({
//       where: { id },
//       include: {
//         booths: true,
//         parties: {
//           include: {
//             candidates: true
//           }
//         },
//         users: true
//       }
//     });
//   }

//   async update(data: UpdateElectionInput): Promise<Election> {
//     const { id, ...updateData } = data;
//     return this.prisma.election.update({
//       where: { id },
//       data: updateData,
//       include: {
//         booths: true,
//         parties: {
//           include: {
//             candidates: true
//           }
//         },
//         users: true
//       }
//     });
//   }

//   async remove(id: string): Promise<Election> {
//     return this.prisma.election.delete({
//       where: { id },
//       include: {
//         booths: true,
//         parties: {
//           include: {
//             candidates: true
//           }
//         },
//         users: true
//       }
//     });
//   }
// }