// gql-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GqlAuthGuard extends AuthGuard('session') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
  
  handleRequest(err: any, user: any) {
    console.log('Authenticated user:', user);
    if (err || !user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return user;
  }
}

