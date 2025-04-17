import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    if (gqlContext.getType() === 'graphql') {
      // For GraphQL requests
      const ctx = gqlContext.getContext();
      return { req: ctx.req, res: ctx.res };
    }
    // For REST requests
    return super.getRequestResponse(context);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use the IP address as the tracker for rate limiting
    return req.ips.length ? req.ips[0] : req.ip;
  }
}
