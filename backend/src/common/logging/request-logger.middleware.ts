import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from './logging.service';
import { v4 as uuid } from 'uuid';

/**
 * Middleware that logs HTTP requests and response details
 * @class RequestLoggerMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  /**
   * Creates an instance of RequestLoggerMiddleware
   * @param {LoggingService} loggingService - The logging service
   */
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext('HttpMiddleware');
  }

  /**
   * Middleware implementation that logs request and response information
   * @param {Request} req - The Express request object
   * @param {Response} res - The Express response object
   * @param {NextFunction} next - The next middleware function
   * @returns {void}
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Generate or use existing request ID
    const requestId = req.headers['x-request-id']?.toString() || uuid();
    req.headers['x-request-id'] = requestId;
    this.loggingService.setRequestId(requestId);
    
    // Log the request
    this.loggingService.logRequest(req);
    
    // Track response time
    const start = Date.now();
    
    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      this.loggingService.log(
        `HTTP Response`,
        'HttpResponse',
        {
          requestId,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        }
      );
    });
    
    next();
  }
}