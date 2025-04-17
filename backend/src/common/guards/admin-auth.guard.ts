
// admin-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminAuthGuard extends AuthGuard('admin-session') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
  
  handleRequest(err: any, admin: any) {
    if (err || !admin || !admin.isActive) {
      throw new UnauthorizedException('Not authenticated as admin');
    }
    return admin;
  }
}