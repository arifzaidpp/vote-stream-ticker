import { UserFilter } from 'src/modules/auth/dto/user/user.dto';

/**
 * Generate cache keys for various entities
 */
export const cacheKeys = {
  user: (id: number) => `user:id-${id}`,
  users: (
    search = '',
    take = 10,
    skip = 0,
    field = 'id',
    direction = 'ASC',
    filter?: UserFilter,
  ) =>
    `users:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  userCount: (filter?: UserFilter) => `user:count:${JSON.stringify(filter)}`,
  
  pendingVerification: (email: string) => `pending-verification:${email}`,
  passwordReset: (token: string) => `password-reset:${token}`,
  adminPasswordReset: (token: string) => `admin-password-reset:${token}`,
};