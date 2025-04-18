// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/shared/prisma/prisma.service';
// import { CreateCandidateInput } from '../dto/candidate/create-candidate.input';
// import { Candidate } from '../model/candidate.model';
// import { UpdateCandidateInput } from '../dto/candidate/update-candidate.input';


// @Injectable()
// export class CandidateService {
//   constructor(private prisma: PrismaService) {}

//   async create(data: CreateCandidateInput): Promise<Candidate> {
//     return this.prisma.candidate.create({
//       data,
//       include: {
//         party: true,
//         results: true
//       }
//     });
//   }

//   async findAll(): Promise<Candidate[]> {
//     return this.prisma.candidate.findMany({
//       include: {
//         party: true,
//         results: true
//       }
//     });
//   }

//   async findByParty(partyId: string): Promise<Candidate[]> {
//     return this.prisma.candidate.findMany({
//       where: { partyId },
//       include: {
//         party: true,
//         results: true
//       }
//     });
//   }

//   async findOne(id: string): Promise<Candidate | null> {
//     return this.prisma.candidate.findUnique({
//       where: { id },
//       include: {
//         party: true,
//         results: true
//       }
//     });
//   }

//   async update(data: UpdateCandidateInput): Promise<Candidate> {
//     const { id, ...updateData } = data;
//     return this.prisma.candidate.update({
//       where: { id },
//       data: updateData,
//       include: {
//         party: true,
//         results: true
//       }
//     });
//   }

//   async remove(id: string): Promise<Candidate> {
//     return this.prisma.candidate.delete({
//       where: { id },
//       include: {
//         party: true,
//         results: true
//       }
//     });
//   }
// }