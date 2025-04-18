// // src/election/election.service.ts
// import { Injectable, Logger, NotFoundException } from '@nestjs/common';
// import { ElectionResponseDto } from './dto/election-response.dto';
// import { PrismaService } from 'src/shared/prisma/prisma.service';
// import { CreateElectionDto } from './dto/election/create-election.input';
// import { CandidatePosition } from './enums/candidate-position.enum';
// import { UpdateElectionDto } from './dto/election/update-election.input';
// import { CacheService } from 'src/shared/cache/cache.service';
// import { PaginationWithSearchInput } from 'src/common/dto/pagination.dto';
// import { SortDirection, SortInput } from 'src/common/dto/sort.dto';
// import { SuccessResponse } from 'src/common/models/pagination.model';
// import { transformDates } from 'src/common/utils/date.utils';
// import { withErrorHandling } from 'src/common/utils/application-error.utils';
// import { generateWhereClause } from 'src/common/utils/where-clause.utils';

// // Cache keys for election entities
// export const electionCacheKeys = {
//   election: (id: string) => `election:id-${id}`,
//   electionByAccessCode: (accessCode: string) => `election:access-code-${accessCode}`,
//   userElections: (userId: number, search?: string, take?: number, skip?: number, field?: string, direction?: string, filter?: any) => 
//     `elections:user-${userId}:${search || ''}:${take || ''}:${skip || ''}:${field || ''}:${direction || ''}:${JSON.stringify(filter) || ''}`,
//   electionCount: (userId: number, filter?: any) => `election:count:user-${userId}:${JSON.stringify(filter) || ''}`,
// };

// export interface ElectionPaginated {
//   items: ElectionResponseDto[];
//   total: number;
//   hasMore: boolean;
// }

// export interface ElectionFilter {
//   name?: string;
//   createdAt?: any;
//   updatedAt?: any;
//   isActive?: boolean;
// }

// @Injectable()
// export class ElectionService {
//   private readonly logger = new Logger(ElectionService.name);
//   private readonly ttl = 7 * 24 * 60 * 60; // 1 week cache TTL

//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly cacheService: CacheService,
//   ) {}

//   async createElection(dto: CreateElectionDto, userId: number): Promise<ElectionResponseDto> {
//     return withErrorHandling(async () => {
//       // Calculate total voters based on booths
//       const totalVoters = dto.booths?.reduce((sum, booth) => sum + booth.voterCount, 0) || 0;

//       // Create election with nested data
//       const election = await this.prisma.election.create({
//         data: {
//           name: dto.name,
//           logo: dto.logo,
//           totalVoters: totalVoters,
//           // Link the election to the user creating it
//           users: {
//             connect: { id: userId }
//           },
//           booths: dto.booths
//             ? {
//                 create: dto.booths.map((b) => ({
//                   boothNumber: b.boothNumber,
//                   voterCount: b.voterCount,
//                 })),
//               }
//             : undefined,
//           parties: dto.parties
//             ? {
//                 create: dto.parties.map((p) => ({
//                   name: p.name,
//                   logo: p.logo,
//                   color: p.color,
//                   candidates: p.candidates
//                     ? {
//                         create: p.candidates.map((c) => ({
//                           name: c.name,
//                           photo: c.photo,
//                           position: c.position as CandidatePosition,
//                         })),
//                       }
//                     : undefined,
//                 })),
//               }
//             : undefined,
//         },
//         include: {
//           booths: true,
//           parties: {
//             include: {
//               candidates: true,
//             },
//           },
//         },
//       });

//       // Invalidate user elections cache
//       await this.invalidateCache(undefined, userId);

//       return election as ElectionResponseDto;
//     }, {
//       entityName: 'election',
//       operation: 'create',
//     });
//   }

//   async updateElection(dto: UpdateElectionDto, userId: number): Promise<ElectionResponseDto> {
//     return withErrorHandling(async () => {
//       // Calculate total voters based on booths
//       const totalVoters = dto.booths?.reduce((sum, booth) => sum + booth.voterCount, 0) || 0;

//       // Update election with nested data
//       const election = await this.prisma.election.update({
//         where: { id: dto.id },
//         data: {
//           name: dto.name,
//           logo: dto.logo,
//           totalVoters: totalVoters,
//           booths: dto.booths
//             ? {
//                 upsert: dto.booths.map((b) => ({
//                   where: { id: b.id }, // Assuming each booth has a unique ID
//                   create: {
//                     boothNumber: b.boothNumber,
//                     voterCount: b.voterCount,
//                   },
//                   update: {
//                     boothNumber: b.boothNumber,
//                     voterCount: b.voterCount,
//                   },
//                 })),
//               }
//             : undefined,
//           parties: dto.parties
//             ? {
//                 create: dto.parties.map((p) => ({
//                   name: p.name,
//                   logo: p.logo,
//                   color: p.color,
//                   candidates: p.candidates
//                     ? {
//                         create: p.candidates.map((c) => ({
//                           name: c.name,
//                           photo: c.photo,
//                           position: c.position as CandidatePosition,
//                         })),
//                       }
//                     : undefined,
//                 })),
//                 update: dto.parties.map((p) => ({
//                   where: { id: p.id }, // Assuming each party has a unique ID
//                   data: {
//                     name: p.name,
//                     logo: p.logo,
//                     color: p.color,
//                     candidates: p.candidates
//                       ? {
//                           update: p.candidates.map((c) => ({
//                             where: { id: c.id }, // Assuming each candidate has a unique ID
//                             data: {
//                               name: c.name,
//                               photo: c.photo,
//                               position: c.position as CandidatePosition,
//                             },
//                           })),
//                         }
//                       : undefined,
//                   },
//                 })),
//               }
//             : undefined,
//         },
//         include: {
//           booths: true,
//           parties: {
//             include: {
//               candidates: true,
//             },
//           },
//         },
//       });

//       // Invalidate affected caches
//       await this.invalidateCache(dto.id, userId);

//       return election as ElectionResponseDto;
//     }, {
//       entityName: 'election',
//       operation: 'update',
//     });
//   }

//   async deleteElection(id: string, userId: number): Promise<ElectionResponseDto> {
//     return withErrorHandling(async () => {
//       const election = await this.prisma.election.delete({
//         where: { id },
//         include: {
//           booths: true,
//           parties: {
//             include: {
//               candidates: true,
//             },
//           },
//         },
//       });

//       // Invalidate affected caches
//       await this.invalidateCache(id, userId);

//       return election as ElectionResponseDto;
//     }, {
//       entityName: 'election',
//       operation: 'delete',
//     });
//   }

//   async deleteManyElections(ids: string[], userId: number): Promise<SuccessResponse> {
//     return withErrorHandling(async () => {
//       const response = await this.prisma.$transaction(async (prisma) => {
//         // Check if all elections exist before attempting to delete
//         const elections = await prisma.election.findMany({
//           where: { id: { in: ids } },
//         });

//         if (elections.length !== ids.length) {
//           throw new NotFoundException('One or more elections not found');
//         }

//         // Delete the elections
//         await prisma.election.deleteMany({
//           where: { id: { in: ids } },
//         });

//         return elections;
//       });

//       // After transaction completes
//       for (const election of response) {
//         await this.invalidateCache(election.id, userId);
//       }

//       return {
//         success: true,
//         message: `${ids.length} elections deleted successfully!`,
//       };
//     }, {
//       entityName: 'election',
//       operation: 'delete many',
//     });
//   }

//   async getAllElectionsByUserId(
//     userId: number,
//     pagination?: PaginationWithSearchInput,
//     sort?: SortInput,
//     filter?: ElectionFilter,
//   ): Promise<ElectionPaginated> {
//     const { skip = 0, take = 10, search = '' } = pagination || {};
//     const { field = 'createdAt', direction = SortDirection.DESC } = sort || {};

//     // Generate unique cache key including all parameters
//     const cacheKey = electionCacheKeys.userElections(
//       userId,
//       search,
//       take,
//       skip,
//       field,
//       direction,
//       filter,
//     );

//     // Check cache first
//     const cachedElections = await this.cacheService.get<ElectionPaginated>(cacheKey);
//     if (cachedElections) return transformDates(cachedElections);

//     // Construct the where filter dynamically
//     const where = generateWhereClause(
//       search, // search keyword
//       ['name'], // searchable fields
//       {
//         ...filter,
//         users: {
//           some: {
//             id: userId,
//           },
//         },
//       }, // filter object with userId constraint
//     );

//     return withErrorHandling(async () => {
//       const elections = await this.prisma.election.findMany({
//         where,
//         orderBy: { [field]: direction },
//         skip,
//         take,
//         include: {
//           booths: true,
//           parties: {
//             include: {
//               candidates: true,
//             },
//           },
//         },
//       });

//       const total = await this.prisma.election.count({ where });

//       // Calculate if there are more items and prepare response
//       const hasMore = skip + take < total;
//       const response = {
//         items: elections as ElectionResponseDto[],
//         total,
//         hasMore,
//       };

//       // Save in cache if successful
//       try {
//         await this.cacheService.set(cacheKey, response, this.ttl);
//       } catch (cacheError) {
//         this.logger.error('Failed to cache elections', {
//           error: cacheError.message,
//         });
//       }

//       return response;
//     }, {
//       entityName: 'elections',
//       operation: 'find all',
//     });
//   }

//   async getElectionByAccessCode(accessCode: string): Promise<ElectionResponseDto> { 
//     const cacheKey = electionCacheKeys.electionByAccessCode(accessCode);
    
//     // Try to get from cache
//     const cachedElection = await this.cacheService.get<ElectionResponseDto>(cacheKey);
//     if (cachedElection) return transformDates(cachedElection);

//     return withErrorHandling(async () => {
//       const election = await this.prisma.election.findUnique({
//         where: { accessCode },
//         include: {
//           booths: true,
//           parties: {
//             include: {
//               candidates: true,
//             },
//           },
//         },
//       });

//       if (!election) throw new NotFoundException('Election not found');

//       // Cache the result
//       try {
//         await this.cacheService.set(cacheKey, election, this.ttl);
//       } catch (error) {
//         this.logger.error('Failed to cache election by access code', {
//           error: error.message,
//         });
//       }

//       return election as ElectionResponseDto;
//     }, {
//       entityName: 'election',
//       operation: 'find by access code',
//     });
//   }

//   async getElectionById(id: string): Promise<ElectionResponseDto> {
//     const cacheKey = electionCacheKeys.election(id);
    
//     // Try to get from cache
//     const cachedElection = await this.cacheService.get<ElectionResponseDto>(cacheKey);
//     if (cachedElection) return transformDates(cachedElection);

//     return withErrorHandling(async () => {
//       const election = await this.prisma.election.findUnique({
//         where: { id },
//         include: {
//           booths: true,
//           parties: {
//             include: {
//               candidates: true,
//             },
//           },
//         },
//       });

//       if (!election) throw new NotFoundException('Election not found');

//       // Cache the result
//       try {
//         await this.cacheService.set(cacheKey, election, this.ttl);
//       } catch (error) {
//         this.logger.error('Failed to cache election', {
//           error: error.message,
//         });
//       }

//       return election as ElectionResponseDto;
//     }, {
//       entityName: 'election',
//       operation: 'find by id',
//     });
//   }

//   async countElections(userId: number, filter?: ElectionFilter): Promise<number> {
//     return withErrorHandling(async () => {
//       // Generate cache key for this filtered count
//       const cacheKey = electionCacheKeys.electionCount(userId, filter);

//       // Try to get count from cache
//       const cachedCount = await this.cacheService.get<number>(cacheKey);
//       if (cachedCount !== null && cachedCount !== undefined)
//         return cachedCount;

//       // Construct the where filter dynamically
//       const where = generateWhereClause(
//         undefined, 
//         undefined, 
//         {
//           ...filter,
//           users: {
//             some: {
//               id: userId,
//             },
//           },
//         }
//       );

//       // Count elections with the filter
//       const count = await this.prisma.election.count({ where });

//       try {
//         // Cache the result
//         await this.cacheService.set(cacheKey, count, this.ttl);
//       } catch (error) {
//         this.logger.error('Failed to cache election count', {
//           error: error.message,
//         });
//       }

//       return count;
//     }, {
//       entityName: 'election',
//       operation: 'count',
//     });
//   }

//   /**
//    * Invalidates various election-related caches
//    * Groups all cache invalidation logic in one place for consistency
//    *
//    * @param electionId - Optional specific election ID to invalidate
//    * @param userId - Optional user ID to invalidate associated elections
//    * @private - Internal function for service use only
//    */
//   private async invalidateCache(electionId?: string, userId?: number): Promise<void> {
//     try {
//       const cacheDeletions: Promise<void>[] = [];

//       // Specific election caches if ID is provided
//       if (electionId) {
//         cacheDeletions.push(
//           this.cacheService.delete(electionCacheKeys.election(electionId)),
//         );

//         // Also need to fetch the election to invalidate by access code if exists
//         const election = await this.prisma.election.findUnique({
//           where: { id: electionId },
//           select: { accessCode: true },
//         });
        
//         if (election?.accessCode) {
//           cacheDeletions.push(
//             this.cacheService.delete(electionCacheKeys.electionByAccessCode(election.accessCode)),
//           );
//         }
//       }

//       // User-specific election caches if userId is provided
//       if (userId) {
//         cacheDeletions.push(this.cacheService.delete(`elections:user-${userId}:*`));
//         cacheDeletions.push(this.cacheService.delete(`election:count:user-${userId}:*`));
//       }

//       // Execute all cache deletions concurrently
//       await Promise.all(cacheDeletions);
//     } catch (error) {
//       this.logger.error('Failed to invalidate election cache', {
//         error: error.message,
//       });
//     }
//   }
// }