// db-error.utils.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';


/**
 * Comprehensive error handler for application operations
 * @param error The caught error
 * @param options Configuration options for error handling
 */
export function handleApplicationError(
  error: any,
  options: {
    entityName?: string;
    operation?: string;
    logErrors?: boolean;
    additionalContext?: Record<string, any>;
  } = {}
): never {
  const {
    entityName = 'item',
    operation = 'process',
    logErrors = true,
    additionalContext = {},
  } = options;

  // Format entity name for messages
  const entity = formatFieldName(entityName);
  const friendlyOperation = getFriendlyOperation(operation);

  // Determine error type and log appropriately
  if (logErrors) {
    console.error(`Error during ${operation} of ${entityName}:`, {
      errorType: error.constructor?.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
      ...additionalContext,
    });
  }

  // Handle NestJS HTTP exceptions (pass through)
  if (
    error.name?.includes('Exception') &&
    typeof error.getStatus === 'function'
  ) {
    throw error;
  }

  // Handle Prisma/database errors
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    (error.code && error.code.startsWith('P'))
  ) {
    handleDatabaseError(error, entityName, operation);
  }

  // Handle cache-related errors
  if (
    error.name === 'CacheError' ||
    error.message?.includes('cache') ||
    error.message?.includes('redis') ||
    error.message?.includes('memcached')
  ) {
    throw new InternalServerErrorException(
      `We ${friendlyOperation}d your ${entity} but had trouble updating our cache. It may not appear immediately.`
    );
  }

  // Handle network/connection errors
  if (
    error.code === 'ECONNREFUSED' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT' ||
    error.message?.includes('network') ||
    error.message?.includes('connection') ||
    error.message?.includes('timeout')
  ) {
    throw new ServiceUnavailableException(
      `We're experiencing connectivity issues. Please try to ${friendlyOperation} your ${entity} again in a moment.`
    );
  }

  // Handle validation errors (non-Prisma)
  if (
    error.name === 'ValidationError' ||
    error.name === 'ValidatorError' ||
    error.message?.includes('validation')
  ) {
    throw new BadRequestException(
      `There seems to be a problem with the information you provided for the ${entity}. Please check it and try again.`
    );
  }

  // Handle authorization/permission errors
  if (
    error.name === 'UnauthorizedError' ||
    error.message?.includes('permission') ||
    error.message?.includes('access') ||
    error.message?.includes('unauthorized') ||
    error.message?.includes('forbidden')
  ) {
    throw new ForbiddenException(
      `You don't have permission to ${friendlyOperation} this ${entity}.`
    );
  }

  // Handle rate limiting errors
  if (
    error.message?.includes('rate limit') ||
    error.message?.includes('too many requests')
  ) {
    throw new TooManyRequestsException(
      `You've made too many requests. Please wait before trying to ${friendlyOperation} this ${entity} again.`
    );
  }

  // Handle transaction errors
  if (error.message?.includes('transaction')) {
    throw new ServiceUnavailableException(
      `We couldn't complete the operation due to a transaction issue. Please try to ${friendlyOperation} your ${entity} again.`
    );
  }

  // Default fallback for unhandled errors
  throw new InternalServerErrorException(
    `We couldn't ${friendlyOperation} your ${entity} due to an unexpected issue. Please try again later.`
  );
}

/**
 * Handles database errors and converts them to user-friendly error messages
 * @param error The caught error
 * @param entityName The name of the entity being operated on (e.g., 'article', 'content')
 * @param operation The operation being performed (e.g., 'create', 'update', 'delete')
 */
export function handleDatabaseError(
  error: any,
  entityName: string = 'item',
  operation: string = 'save',
): never {
  // Log the technical details for developers
  console.error('Database error:', JSON.stringify(error, null, 2));

  // Convert entity name to friendly format
  const entity = formatFieldName(entityName);
  const friendlyOperation = getFriendlyOperation(operation);

  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Extract field name from error for more specific messages
    const fieldName = extractFieldName(error);
    const friendlyFieldName = formatFieldName(fieldName);

    // Unique constraint violation (duplicate entry)
    if (error.code === 'P2002') {
      if (fieldName) {
        throw new ConflictException(
          `This ${friendlyFieldName} is already being used. Please try a different ${friendlyFieldName}.`,
        );
      }
      throw new ConflictException(
        `This ${entity} already exists. Please try with different information.`,
      );
    }

    // Foreign key constraint (missing related entity)
    if (error.code === 'P2003') {
      if (fieldName) {
        throw new BadRequestException(
          `The selected ${friendlyFieldName} is no longer available. Please make another selection.`,
        );
      }
      throw new BadRequestException(
        `Some of the items you selected are no longer available. Please review your choices and try again.`,
      );
    }

    // Record not found
    if (error.code === 'P2025') {
      throw new NotFoundException(
        `This ${entity} is no longer available or doesn't exist.`,
      );
    }

    // Required field missing
    if (error.code === 'P2011') {
      if (fieldName) {
        throw new BadRequestException(
          `Please provide a ${friendlyFieldName}. It's required to ${friendlyOperation} this ${entity}.`,
        );
      }
      throw new BadRequestException(
        `Some required information is missing. Please fill in all required fields and try again.`,
      );
    }

    // Value too long
    if (error.code === 'P2000') {
      if (fieldName) {
        throw new UnprocessableEntityException(
          `The ${friendlyFieldName} you entered is too long. Please shorten it and try again.`,
        );
      }
      throw new UnprocessableEntityException(
        `Some of your text is too long. Please shorten it and try again.`,
      );
    }

    // Default case for other Prisma errors
    throw new InternalServerErrorException(
      `We couldn't ${friendlyOperation} your ${entity}. Please try again later.`,
    );
  }
  // Handle validation errors
  else if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException(
      `There seems to be a problem with the information you provided. Please check it and try again.`,
    );
  }
  // Handle connection errors and timeouts
  else if (
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    (error.message && error.message.includes('timeout'))
  ) {
    throw new InternalServerErrorException(
      `It's taking longer than expected to process your request. Please try again in a moment.`,
    );
  }
  // Handle any other errors with a generic but friendly message
  else {
    throw new InternalServerErrorException(
      `We couldn't ${friendlyOperation} your ${entity} right now. Please try again later.`,
    );
  }
}

/**
 * Extracts field name from Prisma error
 */
function extractFieldName(
  error: Prisma.PrismaClientKnownRequestError,
): string | null {
  // First try to get from target (most common location)
  if (error.meta?.target && Array.isArray(error.meta.target)) {
    return error.meta.target[0];
  }

  // Then try single target value
  if (error.meta?.target) {
    return String(error.meta.target);
  }

  // Then check field_name
  if (error.meta?.field_name) {
    return String(error.meta.field_name);
  }

  // Check for foreign key constraint error pattern
  if (error.code === 'P2003' && error.meta?.field_name_embedded) {
    return String(error.meta.field_name_embedded);
  }

  // Try to extract from error message as last resort
  if (error.message) {
    // Find field in quotes or after common patterns
    const fieldMatch =
      error.message.match(/["'`]([^"'`]+)["'`]/) ||
      error.message.match(/field\s+`([^`]+)`/) ||
      error.message.match(/column\s+["`']([^"`']+)["`']/);

    if (fieldMatch && fieldMatch[1]) {
      return fieldMatch[1];
    }
  }

  return null;
}

/**
 * Formats a database field name into a user-friendly string
 *
 * Examples:
 * - contentBody → content body
 * - user_id → user
 * - adminRoleId → admin role
 * - end_date_time → end date
 */
function formatFieldName(fieldName: string | null): string {
  if (!fieldName) return 'item';

  // Clean up the field name
  let cleanField = fieldName
    .replace(/['"`]/g, '') // Remove quotes
    .replace(/\([^)]*\)/, '') // Remove anything in parentheses
    .trim();

  // Remove table prefixes in foreign key references (e.g., "content_authors.author_id_fkey" → "author_id")
  if (cleanField.includes('.')) {
    cleanField = cleanField.split('.').pop() || cleanField;
  }

  // Remove common suffixes
  cleanField = cleanField
    .replace(/_?(id|fk|pk|idx)$/i, '') // Remove ID-related suffixes
    .replace(/_?fkey$/i, '') // Remove foreign key marker
    .replace(/\(index\)$/i, '') // Remove index marker
    .trim();

  // Handle snake_case (database style)
  if (cleanField.includes('_')) {
    return cleanField
      .split('_')
      .map((part) => part.toLowerCase())
      .filter(
        (part) => part.length > 0 && !['id', 'fk', 'pk', 'idx'].includes(part),
      )
      .join(' ');
  }

  // Handle camelCase (Prisma style)
  return (
    cleanField
      // Insert space before uppercase letters
      .replace(/([A-Z])/g, ' $1')
      // Convert to lowercase
      .toLowerCase()
      // Remove duplicate spaces
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Converts database operation to user-friendly term
 */
function getFriendlyOperation(operation: string): string {
  const operationMap: Record<string, string> = {
    create: 'save',
    update: 'update',
    delete: 'remove',
    find: 'find',
    get: 'retrieve',
  };

  return operationMap[operation.toLowerCase()] || operation;
}

/**
 * Wraps an operation with comprehensive error handling
 * @param operation The operation to perform
 * @param options Configuration options for error handling
 * @returns The result of the operation
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    entityName?: string;
    operation?: string;
    logErrors?: boolean;
    additionalContext?: Record<string, any>;
  } = {}
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleApplicationError(error, options);
    // This line won't be reached because handleApplicationError always throws
    throw error; // For TypeScript
  }
}


// Custom TooManyRequestsException (since it's not in @nestjs/common)
export class TooManyRequestsException extends HttpException {
  constructor(message: string = 'Too Many Requests') {
    super(message, 429);
  }
}