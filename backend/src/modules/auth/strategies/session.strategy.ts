import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../../shared/cache/cache.service';
import { cacheKeys } from '../../../shared/cache/cache-keys.util';

@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy, 'session') {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cacheService: CacheService,
  ) {
    super();
  }

  async validate(request: Request): Promise<any> {
    const sessionId = request.cookies.sessionId;
    
    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }
    
    // Find session
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    
    if (!session || new Date(session.expires) < new Date()) {
      throw new UnauthorizedException('Session expired or invalid');
    }
    
    // Check if user exists and get user data
    const cachedUser = await this.cacheService.get(cacheKeys.user(session.userId));
    
    if (cachedUser) {
      // Update last active time (without waiting)
      this.prisma.session.update({
        where: { id: sessionId },
        data: { lastActiveAt: new Date() },
      }).catch(err => console.error('Failed to update session last active time:', err));
      
      return cachedUser;
    }
    
    // If not in cache, get from database
    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
      },
    });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Update last active time (without waiting)
    this.prisma.session.update({
      where: { id: sessionId },
      data: { lastActiveAt: new Date() },
    }).catch(err => console.error('Failed to update session last active time:', err));
    
    // Cache user data
    await this.cacheService.set(cacheKeys.user(user.id), user);
    
    return user;
  }
}