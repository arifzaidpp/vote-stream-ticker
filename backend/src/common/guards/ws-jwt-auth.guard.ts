// src/auth/guards/ws-jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);
    
    if (!token) {
      throw new WsException('Unauthorized');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);
      // Attach user to socket
      client['user'] = payload;
      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth = client.handshake.headers.authorization || client.handshake.auth.token;
    if (!auth) return undefined;
    
    const [type, token] = auth.toString().split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}