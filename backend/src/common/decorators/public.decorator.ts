import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route or resolver as public (no authentication required)
 * @returns Decorator function
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);