import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from '../logging/logging.service';

/**
 * Filter that catches and processes HTTP exceptions
 * @class HttpExceptionFilter
 * @implements {ExceptionFilter<HttpException>}
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Creates an instance of HttpExceptionFilter
   * @param {LoggingService} loggingService - The logging service
   */
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext('HttpExceptionFilter');
  }

  /**
   * Catches and handles HTTP exceptions
   * @param {HttpException} exception - The caught exception
   * @param {ArgumentsHost} host - The argument host
   * @returns {void}
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Create structured error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? exceptionResponse['message']
          : exception.message,
    };

    // Log the error with appropriate severity based on status code
    if (status >= 500) {
      this.loggingService.error(
        `HTTP Exception ${status}`,
        exception.stack,
        'HttpException',
        {
          requestId: request.headers['x-request-id']?.toString(),
          path: request.url,
          method: request.method,
        },
      );
    } else {
      this.loggingService.warn(
        `HTTP Exception ${status}: ${errorResponse.message}`,
        'HttpException',
        {
          requestId: request.headers['x-request-id']?.toString(),
          path: request.url,
          method: request.method,
        },
      );
    }

    // Send JSON response to client
    response.status(status).json(errorResponse);
  }
}
