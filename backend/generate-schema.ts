// generate-schema.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function generateSchema() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.close(); // closes the app after schema generation
}

generateSchema();
