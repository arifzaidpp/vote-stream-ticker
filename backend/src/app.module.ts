import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import * as depthLimit from 'graphql-depth-limit';

// Configuration imports
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import storageConfig from './config/storage.config';
import cacheConfig from './config/cache.config';
import graphqlConfig from './config/graphql.config';

// Filters and middleware
import { RequestLoggerMiddleware } from './common/logging/request-logger.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { GraphqlExceptionFilter } from './common/filters/graphql-exception.filter';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';
import { NotFoundExceptionFilter } from './common/filters/not-found-exception.filter';

// Modules
import { PrismaModule } from './shared/prisma/prisma.module';
import { LoggingModule } from './common/logging/logging.module';
// import { AuthModule } from './modules/auth/auth.module';

// Providers and controllers
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';


// Other imports
import { ThrottlerModule, ThrottlerStorageService } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { AppResolver } from './app.resolver';
import { AuthModule } from './modules/auth/auth.module';

// Other imports

@Module({
  imports: [
    AppResolver,
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        storageConfig,
        cacheConfig,
        graphqlConfig,
      ],
    }),

    // Built-in NestJS Cache
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('cache.ttl'),
        max: configService.get('cache.max'),
      }),
    }),

    // Throttler
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Convert windowMs (milliseconds) to TTL (seconds)
        const windowMs = config.get<number>(
          'app.rateLimit.windowMs',
          15 * 60 * 1000,
        ); // Default: 15 minutes in ms
        const ttl = Math.floor(windowMs / 1000); // Convert ms to seconds for throttler
        const limit = config.get<number>('app.rateLimit.max', 100); // Default: 100 requests per window

        return [
          {
            ttl,
            limit,
            ignoreUserAgents: [],
          },
        ];
      },
    }),

    // Cron Jobs
    ScheduleModule.forRoot(),
  
    // GraphQL
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Set up subscription configuration
        const subscriptionsEnabled =
          configService.get('graphql.subscriptions') === true;

        return {
          autoSchemaFile: join(
            process.cwd(),
            configService.get('graphql.schemaDestination') as string,
          ),
          sortSchema: true,

          // Updated playground configuration
          playground: false,

          validationRules: [depthLimit(3)], // Limits query depth to 5 levels

          plugins: [
            ApolloServerPluginLandingPageLocalDefault(),
            // Add diagnostic plugin
            {
              async requestDidStart(requestContext) {
                console.log('GraphQL request started');
                console.log('Operation:', requestContext.request.operationName);
                console.log('Context check:', requestContext.contextValue.req ? 'has req' : 'no req');
                
                return {
                  async didEncounterErrors(requestContext) {
                    console.log('GraphQL encountered errors:', requestContext.errors);
                  },
                };
              },
            },
          ],

          // Use Apollo Sandbox instead (newer API)
          // apolloSandbox: configService.get('graphql.sandbox'),

          introspection: configService.get('graphql.introspection'),
          debug: configService.get('graphql.debug'),

          context: ({ req, res, connection }) => ({
            // For HTTP requests
            ...(req && {
              req,
              res,
              headers: req.headers,
            }),
            // For WebSocket connections
            ...(connection && {
              connection,
            }),
          }),

          cors: configService.get('app.cors'),

          // Updated subscriptions configuration
          subscriptions: subscriptionsEnabled
            ? {
                'graphql-ws': true,
              }
            : undefined,

          cache: 'bounded',

          // CSRF Prevention settings
          csrfPrevention: {
            requestHeaders: [
              'x-apollo-operation-name',
              'apollo-require-preflight',
            ],
          },
          formatError: (error) => {
            const originalError = error.extensions?.originalError as { message?: string[]; error?: string; statusCode?: number };
            
            if (originalError && Array.isArray(originalError.message)) {
              // This is a validation error
              return {
                message: originalError.message[0],
                extensions: {
                  code: originalError.error || 'VALIDATION_ERROR',
                  validationErrors: originalError.message,
                  statusCode: originalError.statusCode,
                },
              };
            }
            
            // For other error types
            return {
              message: error.message,
              extensions: {
                code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
                stacktrace: error.extensions?.stacktrace,
              },
            };
          },    
        };
      },
    }),
    // Database
    PrismaModule,
    // Logging
    LoggingModule,
    // AuthModule,
    // Modules
    AuthModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GraphqlExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configures global middleware for the application
   * @param {MiddlewareConsumer} consumer - The middleware consumer
   * @returns {void}
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}