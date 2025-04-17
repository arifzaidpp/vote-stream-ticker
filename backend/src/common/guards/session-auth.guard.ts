import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard for session-based authentication
 */
@Injectable()
export class SessionAuthGuard extends AuthGuard('session') {
  /**
   * Constructor
   * @param reflector For accessing route metadata
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Check if route is public or requires authentication
   * @param context Execution context
   * @returns Boolean indicating if route can be activated
   */
  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    // If not public, check authentication
    return super.canActivate(context);
  }

  /**
   * Get request object based on context type
   * @param context Execution context
   * @returns Request object
   */
  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    } else if (context.getType<string>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().req;
    }
  }
}