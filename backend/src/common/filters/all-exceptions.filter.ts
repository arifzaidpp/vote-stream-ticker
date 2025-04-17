import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from '../logging/logging.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext('AllExceptionsFilter');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    // Skip handling GraphQL exceptions - let Apollo handle them
    if (host.getType<string>() === 'graphql') {
      // Just log the error
      const message = exception instanceof Error ? exception.message : 'Unknown error';
      this.loggingService.error(
        `GraphQL Exception: ${message}`,
        exception instanceof Error ? exception.stack : 'No stack trace',
        'GraphQLException'
      );
      
      // Re-throw for Apollo Server to handle
      throw exception;
    }
    
    // Handle REST API exceptions
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Skip if response is already sent
    if (response.headersSent) {
      return;
    }
    
    // Determine status code and message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = 
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse as any).message
          : exception.message;
    }
    
    // Create structured error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    // Log all unhandled exceptions
    this.loggingService.error(
      `Unhandled Exception: ${message}`,
      exception instanceof Error ? exception.stack : 'No stack trace',
      'UnhandledException',
      {
        requestId: request.headers['x-request-id']?.toString(),
        path: request.url,
        method: request.method,
      }
    );

    // Send JSON response to client only if headers haven't been sent
    try {
      response.status(status).json(errorResponse);
    } catch (err) {
      console.error('Error sending exception response:', err);
    }
  }
}