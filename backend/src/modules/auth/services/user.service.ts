import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaginationWithSearchInput } from 'src/common/dto/pagination.dto';
import { SortDirection, SortInput } from 'src/common/dto/sort.dto';
import { CacheService } from 'src/shared/cache/cache.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UserFilter, UserPaginated } from '../dto/user/user.dto';
import { cacheKeys } from 'src/shared/cache/cache-keys.util';
import { transformDates } from 'src/common/utils/date.utils';
import { generateWhereClause } from 'src/common/utils/where-clause.utils';
import { withErrorHandling } from 'src/common/utils/application-error.utils';
import { User } from '../models/user.model';
import { UpdateProfileInput } from '../dto/user/user-profile.input';
import { ActionType, Entity } from 'src/common/constants/types.constants';
import { SuccessResponse } from 'src/common/models/pagination.model';

/**
 * Service to handle User CRUD operations
 * Uses Prisma as ORM, implements caching strategies, and logs admin actions
 */
@Injectable()
export class UserService {
  /**
   * Initialize the service with required dependencies
   */
  private readonly logger = new Logger(UserService.name);
  private readonly ttl = 7 * 24 * 60 * 60; // 1 week

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Retrieves users with pagination, sorting, searching, and filtering capabilities
   * First checks cache, fetches from database if not found
   *
   * @param pagination - Object containing skip, take and search parameters
   * @param sort - Object containing field and direction for sorting
   * @param filter - Optional filter criteria for users
   * @returns Promise with paginated User objects, total count, and hasMore flag
   */
  async users(
    pagination?: PaginationWithSearchInput,
    sort?: SortInput,
    filter?: UserFilter,
  ): Promise<UserPaginated> {
    const { skip = 0, take = 10, search = '' } = pagination || {};
    const { field = 'createdAt', direction = SortDirection.DESC } = sort || {};

    // Generate unique cache key including all parameters
    const cacheKey = cacheKeys.users(
      search,
      take,
      skip,
      field,
      direction,
      filter,
    );

    // Check cache first
    const cachedUsers = await this.cacheService.get<UserPaginated>(cacheKey);
    if (cachedUsers) return transformDates(cachedUsers);

    // Construct the `where` filter dynamically
    const where = generateWhereClause(
      search, // search keyword
      ['email', 'profile.fullName'], // searchable fields
      filter, // filter object
    );

    // Fetch users with applied filters, sorting, and pagination
    return withErrorHandling(
      async () => {
        const users = await this.prisma.user.findMany({
          where,
          orderBy: { [field]: direction },
          skip,
          take,
          select: {
            id: true,
            email: true,
            createdAt: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        });

        const total = await this.prisma.user.count({ where });

        // Calculate if there are more items and prepare response
        const hasMore = skip + take < total;
        const response = { items: users, total, hasMore };

        // Save in cache if successful
        try {
          await this.cacheService.set(cacheKey, response, this.ttl); // 7 days
        } catch (cacheError) {
          this.logger.error('Failed to cache users', {
            error: cacheError.message,
          });
        }

        return response;
      },
      {
        entityName: 'user',
        operation: 'findAll',
      },
    );
  }

  /**
   * Find a user by their ID
   * Checks cache first, then database if not found
   *
   * @param id - User ID to search for
   * @returns Promise with User object including related entities
   * @throws NotFoundException if user not found
   */
  async userById(id: number): Promise<User> {
    // Generate cache key for this specific user ID
    const cacheKey = cacheKeys.user(id);

    // Try to get user from cache
    const cachedUser = await this.cacheService.get<User>(cacheKey);

    // Return cached user if found, transforming date strings to Date objects
    if (cachedUser) return transformDates(cachedUser);

    return withErrorHandling(
      async () => {
        // Fetch user from database with all related entities
        const user = await this.prisma.user.findUnique({
          where: { id },
          include: {
            profile: true,
          },
        });

        // Throw error if user not found
        if (!user) throw new NotFoundException('User not found');

        try {
          // Store result in cache (TTL: one week) and return
          await this.cacheService.set(cacheKey, user, this.ttl);
        } catch (error) {
          this.logger.error('Failed to cache user', {
            error: error.message,
          });
        }

        return user;
      },
      {
        entityName: 'user',
        operation: 'findById',
      },
    );
  }

  /**
   * Update user profile and log admin action if adminId is provided
   *
   * @param userId - ID of the user to update
   * @param input - New profile data
   * @param adminId - Optional ID of the admin performing the action
   * @param ipAddress - Optional IP address of the admin
   * @returns Promise with updated User object
   */
  async updateUserProfile(
    userId: number,
    input: UpdateProfileInput,
    adminId?: number,
    ipAddress?: string,
  ): Promise<User> {
    const { fullName, avatarUrl } = input;

    return withErrorHandling(
      async () => {
        const response = await this.prisma.$transaction(async (prisma) => {
          // Check if user exists
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
          });

          if (!user) {
            throw new NotFoundException('User not found');
          }

          // Update or create profile
          let updatedUser;

          if (user.profile) {
            // Update existing profile
            updatedUser = await prisma.user.update({
              where: { id: userId },
              data: {
                profile: {
                  update: {
                    fullName: fullName ?? '',
                    avatarUrl,
                  },
                },
              },
              include: {
                profile: true,
              },
            });
          } else {
            // Create new profile
            updatedUser = await prisma.user.update({
              where: { id: userId },
              data: {
                profile: {
                  create: {
                    fullName: fullName ?? '',
                    avatarUrl,
                  },
                },
              },
              include: {
                profile: true,
              },
            });
          }

          return updatedUser;
        });

        // After transaction completes
        await this.invalidateCache(userId, response.email);

        return response;
      },
      {
        entityName: 'user',
        operation: 'updateProfile',
      },
    );
  }

  /**
   * Delete a single user by ID and log the admin action
   *
   * @param id - ID of the user to delete
   * @param adminId - ID of the admin performing the action
   * @param ipAddress - Optional IP address of the admin
   * @returns Promise with success response
   * @throws NotFoundException if user not found
   */
  async deleteUser(
    id: number,
    adminId: number,
    ipAddress?: string,
  ): Promise<SuccessResponse> {
    return withErrorHandling(
      async () => {
        const response = await this.prisma.$transaction(async (prisma) => {
          // Find user to get email before deletion
          const user = await prisma.user.findUnique({
            where: { id },
            select: { email: true, profile: { select: { fullName: true } } },
          });

          // Throw error if user not found
          if (!user) throw new NotFoundException('User not found');

          // Delete the user
          await prisma.user.delete({
            where: { id },
          });

          return user;
        });

        // After transaction completes
        await this.invalidateCache(id, response.email);

        return {
          success: true,
          message: 'User deleted successfully!',
        };
      },
      {
        entityName: 'user',
        operation: 'delete',
      },
    );
  }

  /**
   * Count users based on filter criteria with caching
   *
   * @param filter - Filter object with user properties to filter by
   * @returns Promise with the count as a number
   */
  async countUsers(filter?: UserFilter): Promise<number> {
    return withErrorHandling(
      async () => {
        // Construct the `where` filter dynamically from filter object
        const where = generateWhereClause(undefined, undefined, filter);

        // Generate cache key for this filtered count
        const cacheKey = cacheKeys.userCount(filter);

        // Try to get count from cache
        const cachedCount = await this.cacheService.get<number>(cacheKey);
        if (cachedCount !== null && cachedCount !== undefined)
          return cachedCount;

        // Count users with the filter
        const count = await this.prisma.user.count({ where });

        try {
          // Cache the result
          await this.cacheService.set(cacheKey, count, this.ttl);
        } catch (error) {
          this.logger.error('Failed to cache user count', {
            error: error.message,
          });
        }

        return count;
      },
      {
        entityName: 'user',
        operation: 'count',
      },
    );
  }

  /**
   * Invalidates various user-related caches
   * Groups all cache invalidation logic in one place for consistency
   *
   * @param userId - Optional specific user ID to invalidate
   * @param userEmail - Optional specific user email to invalidate
   * @private - Internal function for service use only
   */
  private async invalidateCache(
    userId?: number,
    userEmail?: string,
  ): Promise<void> {
    try {
      const cacheDeletions: Promise<void>[] = [];

      // Specific user caches if ID or email is provided
      if (userId) {
        cacheDeletions.push(this.cacheService.delete(cacheKeys.user(userId)));
      }

      // Always invalidate list and count caches
      cacheDeletions.push(this.cacheService.delete('users:*'));
      cacheDeletions.push(this.cacheService.delete('user:count:*'));

      // Execute all cache deletions concurrently
      await Promise.all(cacheDeletions);
    } catch (error) {
      this.logger.error('Failed to invalidate user cache', {
        error: error.message,
      });
    }
  }
}
