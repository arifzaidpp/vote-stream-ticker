import { Module } from '@nestjs/common';
import { ElectionService } from './election.service';
import { ElectionController } from './election.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { CacheModule } from '../../shared/cache/cache.module';
import { ElectionResolver } from './election.resolver';

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [ElectionController],
  providers: [ElectionService, ElectionResolver],
  exports: [ElectionService],
})
export class ElectionModule {}