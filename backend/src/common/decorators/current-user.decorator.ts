import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorator to get the current authenticated user from request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    let request;
    
    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest();
    } else if (context.getType<string>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    }
    
    return request.user;
  },
);