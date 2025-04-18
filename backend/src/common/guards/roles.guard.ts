import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context).getContext();
    const user = ctx.req?.user;

    console.log('User in RolesGuard:', user); // ✅ Should now log the correct user object

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const userRole = user.role;

    if (!requiredRoles.includes(userRole)) {
      throw new UnauthorizedException('Not authorized');
    }

    return true;
  }
}
