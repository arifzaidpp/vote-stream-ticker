import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    ExecutionContext,
  } from '@nestjs/common';
  import { ThrottlerException } from '@nestjs/throttler';
  import { Response } from 'express';
  import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
  
  @Catch(ThrottlerException)
  export class ThrottlerExceptionFilter implements ExceptionFilter {
    catch(exception: ThrottlerException, host: ArgumentsHost) {
      const contextType = host.getType();
  
      if (contextType === 'http') {
        // Handle REST requests
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
  
        response.status(HttpStatus.TOO_MANY_REQUESTS).json({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
        });
      } else if (host.getType<GqlContextType>() === 'graphql') {
        // Handle GraphQL requests
        const gqlContext = GqlExecutionContext.create(host as unknown as ExecutionContext);
        const response = gqlContext.getContext().res;
  
        response.status(HttpStatus.TOO_MANY_REQUESTS).json({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
        });
      }
    }
  }