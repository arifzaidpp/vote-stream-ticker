import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from './cache.service';
import { cacheKeys } from './cache-keys.util';

@Injectable()
export class CacheInvalidationUtils {
  private readonly logger = new Logger(CacheInvalidationUtils.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Invalidate content caches related to a specific entity
   * Can be used for categories, tags, authors, series, packets, etc.
   *
   * @param entityType - The type of entity (e.g., 'category', 'tag', 'author', etc.)
   * @param entityId - The ID of the specific entity
   * @param relationTable - The join table name (e.g., 'contentCategory', 'contentTag', etc.)
   * @param relationField - The field name in the relation table (e.g., 'categoryId', 'tagId', etc.)
   * @param filterField - The field in ContentFilterInput that corresponds to this entity (e.g., 'categoryIds')
   */
  async invalidateContentCachesByEntity(
    entityType: string,
    entityId: number,
    relationTable: string,
    relationField: string,
    filterField: string,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Invalidating content caches for ${entityType} ID: ${entityId}`,
      );

      // Find all content items associated with this entity
      const contentItems = await this.prisma[relationTable].findMany({
        where: { [relationField]: entityId },
        select: {
          contentId: true,
          content: {
            select: {
              slug: true,
            },
          },
        },
      });

      this.logger.debug(
        `Found ${contentItems.length} content items for ${entityType} ${entityId}`,
      );

      const cacheDeletions: Promise<void>[] = [];

      // 1. Invalidate individual content item caches
      // if (contentItems.length > 0) {
      //   for (const item of contentItems) {
      //     if (!item.contentId) continue;

      //     // Invalidate by content ID
      //     cacheDeletions.push(
      //       this.cacheService.delete(cacheKeys.contentById(item.contentId)),
      //     );

      //     // Invalidate by content slug if available
      //     if (item.content?.slug) {
      //       cacheDeletions.push(
      //         this.cacheService.delete(
      //           cacheKeys.contentBySlug(item.content.slug),
      //         ),
      //       );
      //     }
      //   }
      // }

      // 2. Invalidate targeted list caches based on entity type and ID
      // Generate pattern to match filters containing this entity ID
      // For arrays like authorIds, categoryIds, tagIds, we need to match any filter that includes this ID
      if (filterField.endsWith('Ids')) {
        // For array fields (authorIds, categoryIds, etc.), match any filter containing this ID
        cacheDeletions.push(
          this.invalidateContentCachesWithArrayFilter(filterField, entityId),
        );
      } else {
        // For single ID fields (packetId, seriesId), match exact values
        cacheDeletions.push(
          this.invalidateContentCachesWithSingleFilter(filterField, entityId),
        );
      }

      // Execute all cache invalidations concurrently
      await Promise.all(cacheDeletions);

      this.logger.debug(
        `Successfully invalidated content caches for ${entityType} ${entityId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate content caches for ${entityType}`,
        {
          error: error.message,
          entityType,
          entityId,
        },
      );
    }
  }

  /**
   * Invalidate content caches with filters containing an array field (authorIds, categoryIds)
   * @param filterField - The field name in the filter
   * @param entityId - The entity ID to match
   */
  private async invalidateContentCachesWithArrayFilter(
    filterField: string,
    entityId: number,
  ): Promise<void> {
    // This is challenging without a way to scan for specific patterns within JSON strings
    // We'll use pattern matching to find keys that might contain this filter

    // For search caches - target any filter containing this entity
    // We're looking for any filter that includes this ID in the specified array
    // Note: This is an approximation since we can't do exact JSON matching with wildcards
    const searchPattern = `content:search:*filter:*"${filterField}"*${entityId}*`;
    await this.cacheService.delete(searchPattern);

    // For count caches
    const countPattern = `content:count:*"${filterField}"*${entityId}*`;
    await this.cacheService.delete(countPattern);
  }

  /**
   * Invalidate content caches with filters containing a single ID field (packetId, seriesId)
   * @param filterField - The field name in the filter
   * @param entityId - The entity ID to match
   */
  private async invalidateContentCachesWithSingleFilter(
    filterField: string,
    entityId: number,
  ): Promise<void> {
    // For search caches - match filters with this exact entity ID
    const searchPattern = `content:search:*filter:*"${filterField}":${entityId}*`;
    await this.cacheService.delete(searchPattern);

    // For count caches
    const countPattern = `content:count:*"${filterField}":${entityId}*`;
    await this.cacheService.delete(countPattern);
  }

  /**
   * Invalidate content caches related to a category
   * @param categoryId - The ID of the category
   */
  async invalidateContentCachesByCategory(categoryId: number): Promise<void> {
    return this.invalidateContentCachesByEntity(
      'category',
      categoryId,
      'contentCategory',
      'categoryId',
      'categoryIds',
    );
  }

  /**
   * Invalidate content caches related to a tag
   * @param tagId - The ID of the tag
   */
  async invalidateContentCachesByTag(tagId: number): Promise<void> {
    return this.invalidateContentCachesByEntity(
      'tag',
      tagId,
      'contentTag',
      'tagId',
      'tagIds', // Assuming there's a tagIds field in ContentFilterInput
    );
  }

  /**
   * Invalidate content caches related to an author
   * @param authorId - The ID of the author
   */
  async invalidateContentCachesByAuthor(authorId: number): Promise<void> {
    return this.invalidateContentCachesByEntity(
      'author',
      authorId,
      'contentAuthor',
      'authorId',
      'authorIds',
    );
  }

  /**
   * Invalidate content caches related to a series
   * @param seriesId - The ID of the series
   */
  // async invalidateContentCachesBySeries(seriesId: number): Promise<void> {
  //   try {
  //     // For direct relations rather than junction tables
  //     const contentItems = await this.prisma.contentItem.findMany({
  //       where: { seriesId },
  //       select: { id: true, slug: true },
  //     });

  //     const cacheDeletions: Promise<void>[] = [];

  //     // Invalidate individual content caches
  //     for (const item of contentItems) {
  //       cacheDeletions.push(
  //         this.cacheService.delete(cacheKeys.contentById(item.id)),
  //       );
  //       cacheDeletions.push(
  //         this.cacheService.delete(cacheKeys.contentBySlug(item.slug)),
  //       );
  //     }

  //     // Invalidate targeted series-specific caches
  //     cacheDeletions.push(
  //       this.invalidateContentCachesWithSingleFilter('seriesId', seriesId),
  //     );

  //     await Promise.all(cacheDeletions);

  //     this.logger.debug(
  //       `Successfully invalidated content caches for series ${seriesId}`,
  //     );
  //   } catch (error) {
  //     this.logger.error('Failed to invalidate content caches for series', {
  //       error: error.message,
  //       seriesId,
  //     });
  //   }
  // }

  /**
   * Invalidate content caches related to a packet
   * @param packetId - The ID of the packet
   */
  // async invalidateContentCachesByPacket(packetId: number): Promise<void> {
  //   try {
  //     const contentItems = await this.prisma.contentItem.findMany({
  //       where: { packetId },
  //       select: { id: true, slug: true },
  //     });

  //     const cacheDeletions: Promise<void>[] = [];

  //     // Invalidate individual content caches
  //     for (const item of contentItems) {
  //       cacheDeletions.push(
  //         this.cacheService.delete(cacheKeys.contentById(item.id)),
  //       );
  //       cacheDeletions.push(
  //         this.cacheService.delete(cacheKeys.contentBySlug(item.slug)),
  //       );
  //     }

  //     // Invalidate targeted packet-specific caches
  //     cacheDeletions.push(
  //       this.invalidateContentCachesWithSingleFilter('packetId', packetId),
  //     );

  //     await Promise.all(cacheDeletions);

  //     this.logger.debug(
  //       `Successfully invalidated content caches for packet ${packetId}`,
  //     );
  //   } catch (error) {
  //     this.logger.error('Failed to invalidate content caches for packet', {
  //       error: error.message,
  //       packetId,
  //     });
  //   }
  // }

  /**
   * Invalidate content caches that match a specific ContentFilterInput field
   * This can be used for non-entity specific fields like status, contentType, isPremium
   *
   * @param field - The field name in ContentFilterInput
   * @param value - The value to match
   */
  async invalidateContentCachesByFilterField(
    field: string,
    value: any,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Invalidating content caches for filter field ${field}: ${value}`,
      );

      // For search caches - any filter with this field and value
      const searchPattern =
        typeof value === 'string'
          ? `content:search:*filter:*"${field}":"${value}"*`
          : `content:search:*filter:*"${field}":${value}*`;

      // For count caches
      const countPattern =
        typeof value === 'string'
          ? `content:count:*"${field}":"${value}"*`
          : `content:count:*"${field}":${value}*`;

      await Promise.all([
        this.cacheService.delete(searchPattern),
        this.cacheService.delete(countPattern),
      ]);

      this.logger.debug(
        `Successfully invalidated content caches for filter field ${field}: ${value}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate content caches for filter field`,
        {
          error: error.message,
          field,
          value,
        },
      );
    }
  }
}
