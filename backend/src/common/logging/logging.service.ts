import { Injectable, Logger, Scope } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';

/**
 * Interface for log context information
 * @interface LogContext
 */
export interface LogContext {
  /** Unique identifier for the request */
  requestId?: string;
  /** User ID associated with the request */
  userId?: number;
  /** Additional context properties */
  [key: string]: any;
}

/**
 * Service responsible for centralized application logging
 * @class LoggingService
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService {
  /** NestJS logger instance */
  private logger = new Logger();
  /** Current logging context */
  private context?: string;
  /** Current request ID */
  private requestId?: string;

  /**
   * Sets the context for this logger instance
   * @param {string} context - The context name (typically the class or component name)
   * @returns {void}
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Sets the request ID for this logger instance
   * @param {string} requestId - The unique request identifier
   * @returns {void}
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  /**
   * Formats a log message with additional context
   * @param {string} message - The log message
   * @param {LogContext} [additionalContext] - Additional contextual information
   * @returns {string} Formatted message with context
   * @private
   */
  private formatMessage(message: string, additionalContext?: LogContext): string {
    const context = { 
      ...(additionalContext || {}),
      ...(this.requestId ? { requestId: this.requestId } : {})
    };

    if (Object.keys(context).length === 0) {
      return message;
    }

    return `${message} ${JSON.stringify(context)}`;
  }

  /**
   * Logs an informational message
   * @param {string} message - The message to log
   * @param {string} [context] - The context of the log (overrides the instance context)
   * @param {LogContext} [additionalContext] - Additional contextual information
   * @returns {void}
   */
  log(message: string, context?: string, additionalContext?: LogContext): void {
    this.logger.log(
      this.formatMessage(message, additionalContext),
      context || this.context
    );
  }

  /**
   * Logs an error message
   * @param {string} message - The error message
   * @param {string} [trace] - The error stack trace
   * @param {string} [context] - The context of the log (overrides the instance context)
   * @param {LogContext} [additionalContext] - Additional contextual information
   * @returns {void}
   */
  error(message: string, trace?: string, context?: string, additionalContext?: LogContext): void {
    this.logger.error(
      this.formatMessage(message, additionalContext),
      trace,
      context || this.context
    );
  }

  /**
   * Logs a warning message
   * @param {string} message - The warning message
   * @param {string} [context] - The context of the log (overrides the instance context)
   * @param {LogContext} [additionalContext] - Additional contextual information
   * @returns {void}
   */
  warn(message: string, context?: string, additionalContext?: LogContext): void {
    this.logger.warn(
      this.formatMessage(message, additionalContext),
      context || this.context
    );
  }

  /**
   * Logs a debug message
   * @param {string} message - The debug message
   * @param {string} [context] - The context of the log (overrides the instance context)
   * @param {LogContext} [additionalContext] - Additional contextual information
   * @returns {void}
   */
  debug(message: string, context?: string, additionalContext?: LogContext): void {
    this.logger.debug(
      this.formatMessage(message, additionalContext),
      context || this.context
    );
  }

  /**
   * Logs a verbose message
   * @param {string} message - The verbose message
   * @param {string} [context] - The context of the log (overrides the instance context)
   * @param {LogContext} [additionalContext] - Additional contextual information
   * @returns {void}
   */
  verbose(message: string, context?: string, additionalContext?: LogContext): void {
    this.logger.verbose(
      this.formatMessage(message, additionalContext),
      context || this.context
    );
  }

  /**
   * Logs HTTP request details
   * @param {Request} req - The Express request object
   * @returns {void}
   */
  logRequest(req: Request): void {
    const requestId = req.headers['x-request-id']?.toString() || this.requestId || uuid();
    const userId = (req as any).user?.id;
    
    const logContext: LogContext = {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    if (userId) {
      logContext.userId = userId;
    }

    this.log(`HTTP Request`, 'HttpRequest', logContext);
  }
}