import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging.service';

/**
 * Global module for logging functionality
 * @class LoggingModule
 */
@Global()
@Module({
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}