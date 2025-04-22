import { Module } from '@nestjs/common';
import { CountingService } from './counting.service';
import { CountingController } from './counting.controller';
import { CountingGateway } from './gateways/counting.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [CountingController],
  providers: [CountingService, CountingGateway],
  exports: [CountingService],
})
export class CountingModule {}