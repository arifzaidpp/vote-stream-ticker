import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    INestApplication,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { PrismaClient } from '@prisma/client';
  
  @Injectable()
  export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
  {
    constructor(private configService: ConfigService) {
      super({
        datasources: {
          db: {
            url: configService.get('database.url'),
          },
        },
        log: configService.get('database.debug')
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      });
    }
  
    async onModuleInit() {
      await this.$connect();
  
      // Middleware for logging
      this.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
  
        if (this.configService.get('database.debug')) {
          console.log(
            `Query ${params.model}.${params.action} took ${after - before}ms`,
          );
        }
  
        return result;
      });
    }
  
    async onModuleDestroy() {
      await this.$disconnect();
    }
  
    async cleanDatabase() {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot clean database in production');
      }
  
      // Only for testing purposes
      const models = Reflect.ownKeys(this).filter((key) => {
        return (
          typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$')
        );
      }) as string[];
  
      return Promise.all(
        models.map((modelKey) => {
          return this[modelKey]?.deleteMany();
        }),
      );
    }
  
    // Helper method for transactions
    async executeInTransaction<T>(
      callback: (prisma: PrismaClient) => Promise<T>,
    ): Promise<T> {
      return this.$transaction(callback);
    }
  
    async enableShutdownHooks(app: INestApplication) {
      // Use process events instead of Prisma events for shutdown hooks
      process.on('beforeExit', async () => {
        await app.close();
      });
    }
  
    // Helper method to ensure a healthy connection
    async healthCheck() {
      try {
        await this.$queryRaw`SELECT 1`;
        return true;
      } catch (e) {
        return false;
      }
    }
  }
  