// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/shared/prisma/prisma.service';
// import { Booth } from '../model/booth.model';
// import { UpdateBoothInput } from '../dto/booth/update-booth.input';
// import { CreateBoothInput } from '../dto/booth/create-booth.input';


// @Injectable()
// export class BoothService {
//   constructor(private prisma: PrismaService) {}

//   async create(data: CreateBoothInput) {
//     console.log('Creating booth with data:', data);
//     return "hi"
    
//   }

//   async findAll(): Promise<Booth[]> {
//     return this.prisma.booth.findMany({
//       include: {
//         election: true,
//         countingRounds: {
//           include: {
//             results: true
//           }
//         }
//       }
//     });
//   }

//   async findByElection(electionId: string): Promise<Booth[]> {
//     return this.prisma.booth.findMany({
//       where: { electionId },
//       include: {
//         election: true,
//         countingRounds: {
//           include: {
//             results: true
//           }
//         }
//       }
//     });
//   }

//   async findOne(id: string): Promise<Booth | null> {
//     return this.prisma.booth.findUnique({
//       where: { id },
//       include: {
//         election: true,
//         countingRounds: {
//           include: {
//             results: true
//           }
//         }
//       }
//     });
//   }

//   async update(data: UpdateBoothInput): Promise<Booth> {
//     const { id, ...updateData } = data;
//     return this.prisma.booth.update({
//       where: { id },
//       data: updateData,
//       include: {
//         election: true,
//         countingRounds: {
//           include: {
//             results: true
//           }
//         }
//       }
//     });
//   }

//   async remove(id: string): Promise<Booth> {
//     return this.prisma.booth.delete({
//       where: { id },
//       include: {
//         election: true,
//         countingRounds: {
//           include: {
//             results: true
//           }
//         }
//       }
//     });
//   }
// }