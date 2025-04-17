import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ErrorCode } from '../constants/error.constants';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    this.logger.error(
      `Prisma Exception: ${exception.code} - ${exception.message}`,
      exception.stack,
    );

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.DATABASE_ERROR;
    let message = 'Database error occurred';

    // Map Prisma error codes to HTTP status codes and custom error codes
    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        statusCode = HttpStatus.CONFLICT;
        const target = exception.meta?.target as string[];
        if (target?.includes('email')) {
          errorCode = ErrorCode.EMAIL_ALREADY_EXISTS;
          message = 'Email is already in use';
        } else if (target?.includes('username')) {
          errorCode = ErrorCode.USERNAME_ALREADY_EXISTS;
          message = 'Username is already taken';
        } else if (target?.includes('slug')) {
          errorCode = ErrorCode.SLUG_ALREADY_EXISTS;
          message = 'Slug already exists';
        } else {
          message = 'Unique constraint violation';
        }
        break;
      case 'P2025': // Record not found
        statusCode = HttpStatus.NOT_FOUND;
        if (exception.message.includes('ContentItem')) {
          errorCode = ErrorCode.CONTENT_NOT_FOUND;
          message = 'Content not found';
        } else if (exception.message.includes('User')) {
          errorCode = ErrorCode.USER_NOT_FOUND;
          message = 'User not found';
        } else if (exception.message.includes('Subscription')) {
          errorCode = ErrorCode.SUBSCRIPTION_NOT_FOUND;
          message = 'Subscription not found';
        } else {
          message = 'Record not found';
        }
        break;
      case 'P2023': // Required field missing
        statusCode = HttpStatus.BAD_REQUEST;
        if (exception.message.includes('email')) {
          errorCode = ErrorCode.VALIDATION_ERROR;
          message = 'Email is required';
        } else if (exception.message.includes('username')) {
          errorCode = ErrorCode.VALIDATION_ERROR;
          message = 'Username is required';
        } else if (exception.message.includes('password')) {
          errorCode = ErrorCode.VALIDATION_ERROR;
          message = 'Password is required';
        }
        break;
      case 'P2016': // Invalid foreign key
        statusCode = HttpStatus.BAD_REQUEST;
        if (exception.message.includes('ContentItem')) {
          errorCode = ErrorCode.INVALID_CONTENT_TYPE;
          message = 'Invalid content type';
        } else {
          message = 'Invalid foreign key';
        }
        break;
      default:
        message = exception.message;
        break;
      case 'P2020': // Invalid relation
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid relation';
        break;
      case 'P2017': // Invalid attribute
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid attribute';
        break;
      case 'P2021': // Invalid orderBy
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid orderBy';
        break;
      case 'P2022': // Invalid cursor
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid cursor';
        break;
      case 'P2018': // Invalid data
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid data';
        break;
    }

    // Log the database error
    this.logger.error(
      `Prisma Exception: ${exception.code} - ${message}`,
      exception.stack,
    );

    response.status(statusCode).json({
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
