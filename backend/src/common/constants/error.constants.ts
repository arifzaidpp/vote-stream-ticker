export enum ErrorCode {
    // Authentication errors
    UNAUTHORIZED = 'UNAUTHORIZED',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    FORBIDDEN = 'FORBIDDEN',
    
    // User errors
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
    EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
    USERNAME_ALREADY_EXISTS = 'USERNAME_ALREADY_EXISTS',
    
    // Content errors
    CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
    SLUG_ALREADY_EXISTS = 'SLUG_ALREADY_EXISTS',
    INVALID_CONTENT_TYPE = 'INVALID_CONTENT_TYPE',
    PREMIUM_CONTENT_ACCESS_DENIED = 'PREMIUM_CONTENT_ACCESS_DENIED',
    
    // Subscription errors
    SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
    SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    
    // Input validation errors
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    
    // Database errors
    DATABASE_ERROR = 'DATABASE_ERROR',
    
    // Server errors
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    
    // Workflow errors
    INVALID_WORKFLOW_TRANSITION = 'INVALID_WORKFLOW_TRANSITION',
  
    // File upload errors
    FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',
    INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
    FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  }
  
  export const ErrorMessages = {
    [ErrorCode.UNAUTHORIZED]: 'You are not authenticated',
    [ErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials',
    [ErrorCode.TOKEN_EXPIRED]: 'Authentication token has expired',
    [ErrorCode.FORBIDDEN]: 'You do not have permission to access this resource',
    
    [ErrorCode.USER_NOT_FOUND]: 'User not found',
    [ErrorCode.USER_ALREADY_EXISTS]: 'User already exists',
    [ErrorCode.EMAIL_ALREADY_EXISTS]: 'Email is already in use',
    [ErrorCode.USERNAME_ALREADY_EXISTS]: 'Username is already taken',
    
    [ErrorCode.CONTENT_NOT_FOUND]: 'Content not found',
    [ErrorCode.SLUG_ALREADY_EXISTS]: 'Slug already exists',
    [ErrorCode.INVALID_CONTENT_TYPE]: 'Invalid content type',
    [ErrorCode.PREMIUM_CONTENT_ACCESS_DENIED]: 'This content requires a premium subscription',
    
    [ErrorCode.SUBSCRIPTION_NOT_FOUND]: 'Subscription not found',
    [ErrorCode.SUBSCRIPTION_EXPIRED]: 'Subscription has expired',
    [ErrorCode.PAYMENT_FAILED]: 'Payment processing failed',
    
    [ErrorCode.VALIDATION_ERROR]: 'Validation error',
    
    [ErrorCode.DATABASE_ERROR]: 'Database error occurred',
    
    [ErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error',
    
    [ErrorCode.INVALID_WORKFLOW_TRANSITION]: 'Invalid workflow stage transition',
  
    [ErrorCode.FILE_SIZE_EXCEEDED]: 'File size exceeded the maximum limit',
    [ErrorCode.INVALID_FILE_TYPE]: 'Invalid file type',
    [ErrorCode.FILE_UPLOAD_FAILED]: 'File upload failed',
  };