import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { transformDates } from 'src/common/utils/date.utils';

/**
 * Centralized cache key definitions for the entire application
 */
export const CacheKeys = {
  // User-related cache keys
  user: {
    byId: (id: number) => `user:id-${id}`,
    list: (search = '', take = 10, skip = 0, field = 'id', direction = 'ASC', filter?: any) =>
      `users:${search}:${take}:${skip}:${field}:${direction}:${JSON.stringify(filter) || ''}`,
    count: (filter?: any) => `user:count:${JSON.stringify(filter) || ''}`,
    auth: {
      pendingVerification: (email: string) => `pending-verification:${email}`,
      passwordReset: (token: string) => `password-reset:${token}`,
      adminPasswordReset: (token: string) => `admin-password-reset:${token}`,
    }
  },
  
  // Election-related cache keys
  election: {
    byId: (id: string) => `election:id-${id}`,
    byAccessCode: (accessCode: string) => `election:access-code-${accessCode}`,
    list: (userId: number, search = '', take = 10, skip = 0, field = 'createdAt', direction = 'DESC', filter?: any) =>
      `elections:user-${userId}:${search || ''}:${take || ''}:${skip || ''}:${field || ''}:${direction || ''}:${JSON.stringify(filter) || ''}`,
    count: (userId: number, filter?: any) => 
      `election:count:user-${userId}:${JSON.stringify(filter) || ''}`,
  }
};

/**
 * TTL configuration by entity type
 */
export interface CacheTTLConfig {
  [key: string]: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private defaultTTL: number;
  private readonly enabled: boolean;
  private readonly ttlSettings: CacheTTLConfig;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.defaultTTL = this.configService.get<number>('cache.ttl', 300);
    this.enabled = this.configService.get<boolean>('cache.enabled', true);
    this.ttlSettings = this.configService.get<CacheTTLConfig>('cache.ttlSettings', {});
  }

  /**
   * Get a value from cache and properly handle date fields
   * @param key Cache key
   */
  async get<T>(key: string): Promise<T | undefined> {
    if (!this.enabled) return undefined;
    
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value === null || value === undefined) return undefined;
      
      // Transform any date fields that might have been corrupted during cache serialization
      return transformDates(value);
    } catch (error) {
      this.logger.warn(`Cache get error for key ${key}: ${error.message}`);
      return undefined;
    }
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.enabled) return;
    
    try {
      // Make sure we're not storing any problematic date objects
      // We'll handle them properly when retrieving
      await this.cacheManager.set(key, value, ttl || this.defaultTTL);
    } catch (error) {
      this.logger.warn(`Cache set error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    if (!this.enabled) return;
    
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.warn(`Cache delete error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Delete multiple cache keys
   * @param keys Array of cache keys to delete
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (!this.enabled || !keys.length) return;
    
    try {
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
    } catch (error) {
      this.logger.warn(`Cache deleteMany error: ${error.message}`);
    }
  }

  /**
   * Delete keys matching a pattern (if cache implementation supports it)
   * @param pattern Pattern to match keys
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!this.enabled) return;
    
    try {
      // This relies on Redis SCAN and DEL commands
      // If the underlying cache doesn't support this operation, it will be a no-op
      if (typeof this.cacheManager['store']?.keys === 'function') {
        const keys = await this.cacheManager['store'].keys(pattern);
        if (keys?.length) {
          await this.deleteMany(keys);
          this.logger.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
        }
      } else {
        this.logger.debug(`Pattern deletion not supported for pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.warn(`Cache deletePattern error for ${pattern}: ${error.message}`);
    }
  }

  /**
   * Clear the entire cache
   */
  async clear(): Promise<void> {
    if (!this.enabled) return;
    
    try {
      if (typeof this.cacheManager['reset'] === 'function') {
        await this.cacheManager['reset']();
      } else if (typeof this.cacheManager['store']?.reset === 'function') {
        await this.cacheManager['store'].reset();
      } else {
        this.logger.warn('Cache manager does not support reset operation');
      }
    } catch (error) {
      this.logger.error(`Error clearing cache: ${error.message}`);
    }
  }

  /**
   * Wrap a function with cache. Will return cached value if exists,
   * otherwise will execute the function and cache the result.
   * @param key Cache key
   * @param fn Function to execute if cache miss
   * @param ttl Time to live in seconds (optional)
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    if (!this.enabled) return fn();
    
    try {
      const cached = await this.get<T>(key);
      if (cached !== undefined) {
        return cached;
      }

      const result = await fn();
      await this.set(key, result, ttl);
      return result;
    } catch (error) {
      this.logger.warn(`Cache wrap error for key ${key}: ${error.message}`);
      return fn();
    }
  }

  /**
   * Set cache with type-specific TTL
   * @param type Entity type used to determine TTL from config
   * @param key Cache key
   * @param value Value to cache
   */
  async setForType<T>(type: string, key: string, value: T): Promise<void> {
    const ttl = this.ttlSettings[type] || this.defaultTTL;
    await this.set(key, value, ttl);
  }
  
  /**
   * Get the TTL for a specific entity type
   * @param type Entity type
   * @returns TTL in seconds
   */
  getTTL(type: string): number {
    return this.ttlSettings[type] || this.defaultTTL;
  }
}