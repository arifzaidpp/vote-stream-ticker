import { Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Prisma } from '@prisma/client';
import { ErrorCode, ErrorMessages } from '../constants/error.constants';

@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphqlExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();
    
    // Log the exception
    this.logger.error(
      `GraphQL Exception: ${info.fieldName} in ${info.parentType.name}`,
      exception.stack,
    );
    
    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      
      return new GraphQLError(
        typeof response === 'object' && response['message'] 
          ? response['message'] 
          : 'An error occurred',
        {
          extensions: {
            code: typeof response === 'object' && response['errorCode'] 
              ? response['errorCode'] 
              : ErrorCode.INTERNAL_SERVER_ERROR,
            http: { status },
          },
        },
      );
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Map Prisma errors to GraphQL errors
      let errorCode = ErrorCode.DATABASE_ERROR;
      let message = 'Database error occurred';
      let status = 500;
      
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          status = 409;
          const target = exception.meta?.target as string[];
          if (target?.includes('email')) {
            errorCode = ErrorCode.EMAIL_ALREADY_EXISTS;
            message = ErrorMessages[ErrorCode.EMAIL_ALREADY_EXISTS];
          } else if (target?.includes('username')) {
            errorCode = ErrorCode.USERNAME_ALREADY_EXISTS;
            message = ErrorMessages[ErrorCode.USERNAME_ALREADY_EXISTS];
          } else if (target?.includes('slug')) {
            errorCode = ErrorCode.SLUG_ALREADY_EXISTS;
            message = ErrorMessages[ErrorCode.SLUG_ALREADY_EXISTS];
          } else {
            message = 'Unique constraint violation';
          }
          break;
        case 'P2025': // Record not found
          status = 404;
          if (exception.message.includes('ContentItem')) {
            errorCode = ErrorCode.CONTENT_NOT_FOUND;
            message = ErrorMessages[ErrorCode.CONTENT_NOT_FOUND];
          } else if (exception.message.includes('User')) {
            errorCode = ErrorCode.USER_NOT_FOUND;
            message = ErrorMessages[ErrorCode.USER_NOT_FOUND];
          } else if (exception.message.includes('Subscription')) {
            errorCode = ErrorCode.SUBSCRIPTION_NOT_FOUND;
            message = ErrorMessages[ErrorCode.SUBSCRIPTION_NOT_FOUND];
          } else {
            message = 'Record not found';
          }
          break;
        // Add more error code mappings as needed
      }
      
      return new GraphQLError(message, {
        extensions: {
          code: errorCode,
          http: { status },
          prismaCode: exception.code,
          meta: exception.meta,
        },
      });
    } else if (exception instanceof GraphQLError) {
      // Re-throw GraphQL errors
      return exception;
    } else {
      // Handle any other exceptions
      return new GraphQLError('Internal server error', {
        extensions: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          http: { status: 500 },
        },
      });
    }
  }
}