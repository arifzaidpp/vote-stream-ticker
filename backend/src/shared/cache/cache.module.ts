import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { CacheInvalidationUtils } from './invalidate-content-cache.utils';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          ttl: configService.get('cache.ttl', 300), // 5 minutes default
          max: configService.get('cache.max', 100), // Maximum number of items in cache
          isGlobal: true,
        };
      },
    }),
  ],
  providers: [CacheService, CacheInvalidationUtils],
  exports: [CacheService, CacheInvalidationUtils],
})
export class CacheModule {}