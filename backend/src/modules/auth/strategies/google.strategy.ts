import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../../shared/cache/cache.service';
import { cacheKeys } from '../../../shared/cache/cache-keys.util';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaClient,
    private readonly cacheService: CacheService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;
    
    if (!emails || emails.length === 0) {
      return done(new Error('Google authentication failed: No email provided'), null);
    }
    
    const email = emails[0].value;
    const avatarUrl = photos && photos.length > 0 ? photos[0].value : null;

    // Check if user exists by Google ID or email
    let user = await this.prisma.user.findUnique({
      where: { googleId: id },
      include: {
        profile: true,
      },
    });
    
    let isNewUser = false;
    
    if (!user) {
      // Check if user exists by email
      user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
        },
      });
      
      if (user) {
        // Link Google ID to existing account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: id,
          },
          include: {
            profile: true,
          },
        });
      } else {
        // Create new user
        isNewUser = true;
        user = await this.prisma.user.create({
          data: {
            email,
            googleId: id,
            profile: {
              create: {
                fullName: displayName || 'Google User',
                avatarUrl,
              },
            },
          },
          include: {
            profile: true,
          },
        });
        
        // Invalidate users pagination cache
        await this.cacheService.delete('users:*');
      }
    }
    
    // Cache updated user
    await this.cacheService.set(cacheKeys.user(user.id), user);
    
    // Add isNewUser flag to the user object
    const enhancedUser = {
      ...user,
      isNewUser,
    };
    
    return done(null, enhancedUser);
  }
}