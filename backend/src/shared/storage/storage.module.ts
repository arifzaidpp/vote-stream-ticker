import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';
import { S3Provider } from './s3.provider';
import { LocalStorageProvider } from './local-storage.provider';
import { ImageProcessor } from './image-processor.service';
import { StorageController } from './storage.controller';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [StorageService, S3Provider, LocalStorageProvider, ImageProcessor],
  exports: [StorageService],
})
export class StorageModule {}