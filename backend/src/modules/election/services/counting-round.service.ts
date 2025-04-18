// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/shared/prisma/prisma.service';
// import { CountingRound } from '../model/counting-round.model';
// import { CreateCountingRoundInput } from '../dto/counting-round/create-counting-round.input';
// import { UpdateCountingRoundInput } from '../dto/counting-round/update-counting-round.input';

// @Injectable()
// export class CountingRoundService {
//   constructor(private prisma: PrismaService) {}

//   async create(data: CreateCountingRoundInput): Promise<CountingRound> {
//     const { results, ...roundData } = data;
    
//     // Create counting round with optional results
//     return this.prisma.countingRound.create({
//       data: {
//         ...roundData,
//         results: results ? {
//           create: results
//         } : undefined
//       },
//       include: {
//         booth: true,
//         results: {
//           include: {
//             candidate: true
//           }
//         }
//       }
//     });
//   }

//   async findAll(): Promise<CountingRound[]> {
//     return this.prisma.countingRound.findMany({
//       include: {
//         booth: true,
//         results: {
//           include: {
//             candidate: true
//           }
//         }
//       }
//     });
//   }

//   async findByBooth(boothId: string): Promise<CountingRound[]> {
//     return this.prisma.countingRound.findMany({
//       where: { boothId },
//       include: {
//         booth: true,
//         results: {
//           include: {
//             candidate: true
//           }
//         }
//       }
//     });
//   }

//   async findOne(id: string): Promise<CountingRound | null> {
//     return this.prisma.countingRound.findUnique({
//       where: { id },
//       include: {
//         booth: true,
//         results: {
//           include: {
//             candidate: true
//           }
//         }
//       }
//     });
//   }

//   async update(data: UpdateCountingRoundInput): Promise<CountingRound> {
//     const { id, ...updateData } = data;
//     return this.prisma.countingRound.update({
//       where: { id },
//       data: updateData,
//       include: {
//         booth: true,
//         results: {
//           include: {
//             candidate: true
//           }
//         }
//       }
//     });
//   }

//   async remove(id: string): Promise<CountingRound> {
//     return this.prisma.countingRound.delete({
//       where: { id },
//       include: {
//         booth: true,
//         results: {
//           include: {
//             candidate: true
//           }
//         }
//       }
//     });
//   }
// }