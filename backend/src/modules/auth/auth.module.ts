import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { JwtModule } from '@nestjs/jwt'; // Add this import

// Services
import { UserService } from './services/user.service';

// Strategies
import { GoogleStrategy } from './strategies/google.strategy';
import { SessionStrategy } from './strategies/session.strategy';
import { CacheModule } from 'src/shared/cache/cache.module';
import { UserAuthService } from './services/user-auth.service';
import { MailModule } from 'src/shared/mail/mail.module';

// Resolvers
import { UserAuthResolver } from './resolvers/user-auth.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'session' }),
    ConfigModule,
    CacheModule,
    MailModule,
    // Add JwtModule
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { 
          expiresIn: '24h' // Token expires in 24 hours
        },
      }),
    }),
  ],
  providers: [
    PrismaClient,
    
    // Services
    UserAuthService,
    UserService,
    
    // Strategies
    GoogleStrategy,
    SessionStrategy,
    JwtStrategy,
    
    // Resolvers
    UserAuthResolver,
    UserResolver,
  ],
  exports: [
    PassportModule,
    UserAuthService,
    JwtModule, // Export JwtModule as well
  ],
})
export class AuthModule {}