import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

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


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'session' }),
    ConfigModule,
    CacheModule,
    MailModule,
  ],
  providers: [
    PrismaClient,
    
    // Services
    UserAuthService,
    UserService,
    
    // Strategies
    GoogleStrategy,
    SessionStrategy,
    
    // Resolvers
    UserAuthResolver,
    UserResolver,
  ],
  exports: [
    PassportModule,
    UserAuthService,
  ],
})
export class AuthModule {}