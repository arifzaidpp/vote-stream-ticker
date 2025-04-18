// // src/election/services/result.service.ts
// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/shared/prisma/prisma.service';
// import { Result } from '../model/result.model';
// import { CreateResultInput } from '../dto/result/create-result.input';

// @Injectable()
// export class ResultService {
//   constructor(private prisma: PrismaService) {}

//   async create(data: CreateResultInput): Promise<Result> {
//     return this.prisma.result.create({
//       data,
//       include: {
//         candidate: true,
//         countingRound: true
//       }
//     });
//   }

//   async findAll(): Promise<Result[]> {
//     return this.prisma.result.findMany({
//       include: {
//         candidate: true,
//         countingRound: true
//       }
//     });
//   }

//   async findByCountingRound(countingRoundId: string): Promise<Result[]> {
//     return this.prisma.result.findMany({
//       where: { countingRoundId },
//       include: {
//         candidate: true,
//         countingRound: true
//       }
//     });
//   }

//   async findOne(id: string): Promise<Result | null> {
//     return this.prisma.result.findUnique({
//       where: { id },
//       include: {
//         candidate: true,
//         countingRound: true
//       }
//     });
//   }

//   async update(data: UpdateResultInput): Promise<Result> {
//     const { id, ...updateData } = data;
//     return this.prisma.result.update({
//       where: { id },
//       data: updateData,
//       include: {
//         candidate: true,
//         countingRound: true
//       }
//     });
//   }

//   async remove(id: string): Promise<Result> {
//     return this.prisma.result.delete({
//       where: { id },
//       include: {
//         candidate: true,
//         countingRound: true
//       }
//     });
//   }
// }
