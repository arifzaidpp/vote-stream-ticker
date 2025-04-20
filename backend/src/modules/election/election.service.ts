import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ElectionResponseDto } from './dto/election-response.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateElectionDto } from './dto/election/create-election.input';
import { CandidatePosition } from './enums/candidate-position.enum';
import { UpdateElectionDto } from './dto/election/update-election.input';
import { CacheService, CacheKeys } from 'src/shared/cache/cache.service';
import { PaginationWithSearchInput } from 'src/common/dto/pagination.dto';
import { SortDirection, SortInput } from 'src/common/dto/sort.dto';
import { SuccessResponse } from 'src/common/models/pagination.model';
import { withErrorHandling } from 'src/common/utils/application-error.utils';
import { generateWhereClause } from 'src/common/utils/where-clause.utils';

export interface ElectionPaginated {
  items: ElectionResponseDto[];
  total: number;
  hasMore: boolean;
}

export interface ElectionFilter {
  name?: string;
  createdAt?: any;
  updatedAt?: any;
  isActive?: boolean;
}

@Injectable()
export class ElectionService {
  private readonly logger = new Logger(ElectionService.name);
  private readonly ENTITY_TYPE = 'election';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new election
   */
  async createElection(dto: CreateElectionDto, userId: number): Promise<ElectionResponseDto> {
    return withErrorHandling(async () => {
      // Calculate total voters based on booths
      const totalVoters = dto.booths?.reduce((sum, booth) => sum + booth.voterCount, 0) || 0;

      // Create election with nested data
      const election = await this.prisma.election.create({
        data: {
          name: dto.name,
          logo: dto.logo,
          totalVoters: totalVoters,
          userId: userId,
          booths: dto.booths
            ? {
              create: dto.booths.map((b) => ({
                boothNumber: b.boothNumber,
                voterCount: b.voterCount,
              })),
            }
            : undefined,
          parties: dto.parties
            ? {
              create: dto.parties.map((p) => ({
                name: p.name,
                logo: p.logo,
                color: p.color,
                candidates: p.candidates
                  ? {
                    create: p.candidates.map((c) => ({
                      name: c.name,
                      photo: c.photo,
                      position: c.position as CandidatePosition,
                    })),
                  }
                  : undefined,
              })),
            }
            : undefined,
        },
        include: {
          booths: true,
          parties: {
            include: {
              candidates: true,
            },
          },
        },
      });

      // Invalidate user elections cache
      await this.invalidateUserElectionCaches(userId);

      return election as ElectionResponseDto;
    }, {
      entityName: 'election',
      operation: 'create',
    });
  }

  /**
   * Update an existing election
   */
  async updateElection(dto: UpdateElectionDto, userId: number): Promise<ElectionResponseDto> {
    return withErrorHandling(async () => {
      // Prepare the update data
      const updateData: any = {};

      // Add simple fields if provided
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.logo !== undefined) updateData.logo = dto.logo;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.accessCode !== undefined) updateData.accessCode = dto.accessCode;

      // Handle booths update if provided
      if (dto.booths && dto.booths.length > 0) {
        // Calculate new total voters based on booths
        const totalVoters = dto.booths.reduce((sum, booth) => {
          return sum + (booth.voterCount ?? 0);
        }, 0);

        updateData.totalVoters = totalVoters;

        // Set up booth updates
        updateData.booths = {
          updateMany: dto.booths
            .filter(booth => booth.id)
            .map(booth => ({
              where: { id: booth.id },
              data: {
                ...(booth.boothNumber !== undefined && { boothNumber: booth.boothNumber }),
                ...(booth.voterCount !== undefined && { voterCount: booth.voterCount }),
              },
            })),
        };
      }

      // Handle parties update if provided
      if (dto.parties && dto.parties.length > 0) {
        updateData.parties = {
          updateMany: dto.parties
            .filter(party => party.id)
            .map(party => {
              const partyData: any = {
                where: { id: party.id },
                data: {},
              };

              // Add party fields if provided
              if (party.name !== undefined) partyData.data.name = party.name;
              if (party.logo !== undefined) partyData.data.logo = party.logo;
              if (party.color !== undefined) partyData.data.color = party.color;

              return partyData;
            }),
        };

        // Handle candidate updates for each party
        for (const party of dto.parties) {
          if (party.candidates && party.candidates.length > 0) {
            for (const candidate of party.candidates) {
              if (candidate.id) {
                await this.prisma.candidate.update({
                  where: { id: candidate.id },
                  data: {
                    ...(candidate.name !== undefined && { name: candidate.name }),
                    ...(candidate.photo !== undefined && { photo: candidate.photo }),
                    ...(candidate.position !== undefined && {
                      position: candidate.position as CandidatePosition
                    }),
                  },
                });
              }
            }
          }
        }
      }

      // Update the election with the prepared data
      const election = await this.prisma.election.update({
        where: { id: dto.id },
        data: updateData,
        include: {
          booths: true,
          parties: {
            include: {
              candidates: true,
            },
          },
        },
      });

      // Invalidate affected caches
      await this.invalidateElectionCaches(dto.id, userId);

      return election as ElectionResponseDto;
    }, {
      entityName: 'election',
      operation: 'update',
    });
  }

  /**
   * Delete an election by ID
   */
  async deleteElection(id: string, userId: number): Promise<ElectionResponseDto> {
    return withErrorHandling(async () => {
      // First retrieve the election to have data for cache invalidation
      const election = await this.prisma.election.findUnique({
        where: { id },
        select: { id: true, accessCode: true },
      });

      if (!election) {
        throw new NotFoundException('Election not found');
      }

      // Delete in a transaction to ensure all related entities are removed
      const deletedElection = await this.prisma.$transaction(async (tx) => {
        // Delete related results before deleting counting rounds
        await tx.result.deleteMany({
          where: { countingRound: { booth: { electionId: id } } },
        });

        // Delete related counting rounds after results are removed
        await tx.countingRound.deleteMany({
          where: { booth: { electionId: id } },
        });

        // Delete booths after related counting rounds are removed
        await tx.booth.deleteMany({
          where: { electionId: id },
        });

        // Delete candidates before parties
        await tx.candidate.deleteMany({
          where: { party: { electionId: id } },
        });

        // Delete parties
        await tx.party.deleteMany({
          where: { electionId: id },
        });

        // Finally delete the election
        return tx.election.delete({
          where: { id },
          include: {
            booths: true,
            parties: {
              include: {
                candidates: true,
              },
            },
          },
        });
      });

      // Invalidate affected caches
      await this.invalidateElectionCaches(id, userId);

      return deletedElection as ElectionResponseDto;
    }, {
      entityName: 'election',
      operation: 'delete',
    });
  }

  /**
   * Delete multiple elections by IDs
   */
  async deleteManyElections(ids: string[], userId: number): Promise<SuccessResponse> {
    return withErrorHandling(async () => {
      // Fetch elections first to get their access codes for cache invalidation
      const elections = await this.prisma.election.findMany({
        where: { id: { in: ids } },
        select: { id: true, accessCode: true },
      });

      if (elections.length !== ids.length) {
        throw new NotFoundException('One or more elections not found');
      }

      // Delete in a transaction
      await this.prisma.$transaction(async (tx) => {
        // Delete related data first
        await tx.result.deleteMany({
          where: { countingRound: { booth: { electionId: { in: ids } } } },
        });

        await tx.countingRound.deleteMany({
          where: { booth: { electionId: { in: ids } } },
        });

        await tx.booth.deleteMany({
          where: { electionId: { in: ids } },
        });

        await tx.candidate.deleteMany({
          where: { party: { electionId: { in: ids } } },
        });

        await tx.party.deleteMany({
          where: { electionId: { in: ids } },
        });

        // Finally delete the elections
        await tx.election.deleteMany({
          where: { id: { in: ids } },
        });
      });

      // Invalidate caches for all deleted elections
      await Promise.all(elections.map(election => 
        this.invalidateElectionCaches(election.id, userId)
      ));

      return {
        success: true,
        message: `${ids.length} elections deleted successfully!`,
      };
    }, {
      entityName: 'election',
      operation: 'delete many',
    });
  }

  /**
   * Get all elections for a user with pagination, sorting and filtering
   */
  async getAllElectionsByUserId(
    userId: number,
    pagination?: PaginationWithSearchInput,
    sort?: SortInput,
    filter?: ElectionFilter,
  ): Promise<ElectionPaginated> {
    const { skip = 0, take = 10, search = '' } = pagination || {};
    const { field = 'createdAt', direction = SortDirection.DESC } = sort || {};

    // Generate unique cache key including all parameters
    const cacheKey = CacheKeys.election.list(
      userId,
      search,
      take,
      skip,
      field,
      direction,
      filter,
    );

    return this.cacheService.wrap<ElectionPaginated>(
      cacheKey,
      async () => {
        // Construct the where filter dynamically
        const where = generateWhereClause(
          search,
          ['name'],
          {
            ...filter,
            userId,
          },
        );

        const [elections, total] = await Promise.all([
          this.prisma.election.findMany({
            where,
            orderBy: { [field]: direction },
            skip,
            take,
            include: {
              booths: true,
              parties: {
                include: {
                  candidates: true,
                },
              },
            },
          }),
          this.prisma.election.count({ where }),
        ]);

        // Calculate if there are more items and prepare response
        const hasMore = skip + take < total;
        return {
          items: elections as ElectionResponseDto[],
          total,
          hasMore,
        };
      },
      this.cacheService.getTTL(this.ENTITY_TYPE)
    );
    // No need to manually call transformDates here anymore - it's handled in the cache service
  }

  /**
   * Get an election by access code
   */
  async getElectionByAccessCode(accessCode: string): Promise<ElectionResponseDto> {
    const cacheKey = CacheKeys.election.byAccessCode(accessCode);

    return this.cacheService.wrap<ElectionResponseDto>(
      cacheKey,
      async () => {
        const election = await this.prisma.election.findUnique({
          where: { accessCode },
          include: {
            booths: true,
            parties: {
              include: {
                candidates: true,
              },
            },
          },
        });

        if (!election) throw new NotFoundException('Election not found');
        return election as ElectionResponseDto;
      },
      this.cacheService.getTTL(this.ENTITY_TYPE)
    );
  }

  /**
   * Get an election by ID
   */
  async getElectionById(id: string): Promise<ElectionResponseDto> {
    const cacheKey = CacheKeys.election.byId(id);

    return this.cacheService.wrap<ElectionResponseDto>(
      cacheKey,
      async () => {
        const election = await this.prisma.election.findUnique({
          where: { id },
          include: {
            booths: true,
            parties: {
              include: {
                candidates: true,
              },
            },
          },
        });

        if (!election) throw new NotFoundException('Election not found');
        return election as ElectionResponseDto;
      },
      this.cacheService.getTTL(this.ENTITY_TYPE)
    );
  }

  /**
   * Count elections for a user with optional filters
   */
  async countElections(userId: number, filter?: ElectionFilter): Promise<number> {
    const cacheKey = CacheKeys.election.count(userId, filter);

    return this.cacheService.wrap<number>(
      cacheKey,
      async () => {
        const where = generateWhereClause(
          undefined,
          undefined,
          {
            ...filter,
            userId,
          }
        );

        return this.prisma.election.count({ where });
      },
      this.cacheService.getTTL(this.ENTITY_TYPE)
    );
  }

  /**
   * Invalidate caches for a specific election
   * @private
   */
  private async invalidateElectionCaches(electionId: string, userId?: number): Promise<void> {
    try {
      const cachesToInvalidate: string[] = [
        CacheKeys.election.byId(electionId),
      ];

      // Get the election access code for additional cache invalidation
      const election = await this.prisma.election.findUnique({
        where: { id: electionId },
        select: { accessCode: true },
      });

      if (election?.accessCode) {
        cachesToInvalidate.push(
          CacheKeys.election.byAccessCode(election.accessCode)
        );
      }

      // Invalidate all caches at once
      await this.cacheService.deleteMany(cachesToInvalidate);
      
      // If userId is provided, also invalidate user-related election caches
      if (userId) {
        await this.invalidateUserElectionCaches(userId);
      }
      
      this.logger.debug(`Invalidated caches for election: ${electionId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate election cache: ${error.message}`, {
        electionId,
        userId,
      });
    }
  }

  /**
   * Invalidate all election caches for a specific user
   * @private
   */
  private async invalidateUserElectionCaches(userId: number): Promise<void> {
    try {
      // For Redis-compatible stores, we can use pattern deletion
      await this.cacheService.deletePattern(`elections:user-${userId}:*`);
      await this.cacheService.deletePattern(`election:count:user-${userId}:*`);
      
      this.logger.debug(`Invalidated election caches for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate user election caches: ${error.message}`, {
        userId,
      });
    }
  }
}