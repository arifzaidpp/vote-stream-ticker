import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { cacheKeys } from './cache-keys.util';

@Injectable()
export class CacheService {
  private defaultTTL: number;
  private readonly enabled: boolean;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.defaultTTL = this.configService.get<number>('cache.ttl', 300);
    this.enabled = this.configService.get<boolean>('cache.enabled', true);
  }

  /**
   * Get a value from cache
   * @param key Cache key
   */
  async get<T>(key: string): Promise<T | undefined> {
    if (!this.enabled) return undefined;
    const value = await this.cacheManager.get<T>(key);
    return value === null ? undefined : value;
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl || this.defaultTTL);
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Clear the entire cache by deleting many keys
   * Note: This is a simplistic implementation since not all cache stores support direct clearing
   */
  async clear(): Promise<void> {
    try {
      // The NestJS cache manager doesn't provide a direct method to clear all cache
      // We can use the internal method if available, otherwise log a warning
      if (typeof this.cacheManager['reset'] === 'function') {
        await this.cacheManager['reset']();
      } else {
        console.warn('Cache manager does not support reset operation');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
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
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  async setForType<T>(type: string, key: string, value: T): Promise<void> {
    const ttlSettings = this.configService.get('cache.ttlSettings', {});
    const ttl = ttlSettings[type] || this.defaultTTL;
    await this.set(key, value, ttl);
  }
}