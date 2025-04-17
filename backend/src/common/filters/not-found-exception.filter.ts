import {
  ExceptionFilter,
  Catch,
  NotFoundException,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { LoggingService } from '../logging/logging.service';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext('NotFoundExceptionFilter');
  }

  catch(exception: NotFoundException, host: ArgumentsHost) {
    // Check if it's a GraphQL or HTTP request
    const isGraphQL = host.getType<GqlContextType>() === 'graphql';
    
    if (isGraphQL) {
      // For GraphQL, log it but let GraphQL handle the response
      const gqlHost = GqlArgumentsHost.create(host);
      const { info, context } = gqlHost.getInfo ? gqlHost.getInfo() : { info: null, context: null };
      
      this.loggingService.error(
        `Not Found Exception: ${exception.message}`,
        exception.stack,
        'NotFoundException',
        {
          requestId: context?.req?.headers['x-request-id'] || 'N/A',
          path: context?.req?.url || 'unknown',
          operation: info?.fieldName || 'unknown-operation',
        }
      );
      
      // Re-throw for GraphQL to handle
      throw exception;
    } else {
      // For REST API
      const ctx = host.switchToHttp();
      const request = ctx.getRequest();
      const response = ctx.getResponse() as Response;
      
      // Log the not found error
      this.loggingService.error(
        `Not Found Exception: ${exception.message}`,
        exception.stack,
        'NotFoundException',
        {
          requestId: request.headers['x-request-id'] || 'N/A',
          path: request.url,
          method: request.method,
        }
      );

      // Custom error response
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'The requested resource was not found.',
        error: 'Not Found',
        details: {
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
          requestId: request.headers['x-request-id'] || 'N/A',
        },
      });
    }
  }
}