import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { PrismaService } from './shared/prisma/prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

/**
 * Bootstrap the application
 *  @async @function bootstrap
 *  @returns {Promise<void>}
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  // Ensure proper shutdown with Prisma
  prismaService.enableShutdownHooks(app);

  // Parse cookies
  // app.use(cookieParser());

  // Security with Helmet (if enabled)
  if (configService.get('app.helmet')) {
    app.use(
      helmet({
        contentSecurityPolicy:
          configService.get('app.environment') === 'production',
      }),
      
    );
  }

  // Compression
  // app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform payloads to DTO instances
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw errors if non-whitelisted values are provided
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit conversion of primitives
      },
    }),
  );

  // TODO : Enable CORS if needed

  // CORS if enabled
  // if (configService.get('app.cors.enabled')) {
  //   app.enableCors({
  //     origin: configService.get('app.cors.origin'),
  //     credentials: configService.get('app.cors.credentials'),
  //   });
  // }

  // Enable CORS for all domains
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Set global prefix if configured
  const apiPrefix = configService.get('app.apiPrefix');
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


  // Setup Swagger documentation for REST endpoints
  const swaggerConfig = new DocumentBuilder()
    .setTitle('College Election System API')
    .setDescription('API for managing college elections and results')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Start the server
  const port = configService.get('app.port');
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `GraphQL Apollo Sandbox: http://localhost:${port}/${configService.get('graphql.path')}`,
  );
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
}

// Start the application
bootstrap();
