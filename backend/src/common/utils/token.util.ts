import { sign, verify } from 'jsonwebtoken';

/**
 *  Generate JWT tokens for user
 *
 * @param userId  - user id
 * @param roles  - array of roles
 * @param permissions  - array of permissions
 * @param accessSecret  - access secret
 * @param refreshSecret  - refresh secret
 * @param accessExpiresIn  - access token expiration time
 * @param refreshExpiresIn  - refresh token expiration time
 * @returns - object with access and refresh tokens
 */
export const generateJwtTokens = (
  userId: number,
  roles: string[],
  permissions: string[],
  accessSecret: string,
  refreshSecret: string,
  accessExpiresIn: string = '1d',
  refreshExpiresIn: string = '30d',
) => {
  const payload = { userId, roles, permissions };

  const accessToken = sign(payload, accessSecret, {
    expiresIn: accessExpiresIn,
  });

  const refreshToken = sign(payload, refreshSecret, {
    expiresIn: refreshExpiresIn,
  });

  return {
    accessToken,
    refreshToken,
  };
};

/**
 *  Validate JWT token
 *
 * @param token - JWT token
 * @param secret  - secret key
 * @returns - decoded token
 */
export const validateJwtToken = (token: string, secret: string) => {
  try {
    return verify(token, secret);
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from header and return it
 *
 * @param request - request object
 * @returns - token from header
 */
export const extractTokenFromHeader = (request: any): string | undefined => {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
};

/**
 * Generate email verification token
 *
 * @param userId - user id
 * @param secret - secret key
 * @param expiresIn - expiration time
 * @returns - email verification token
 */
export const generateEmailVerificationToken = (
  email : string,
  secret: string,
  expiresIn: string,
) => {
  return sign({ email }, secret, { expiresIn });
};

/**
 * Generate password reset token
 *
 * @param userId - user id
 * @param secret - secret key
 * @param expiresIn - expiration time
 * @returns - password reset token
 */
export const generatePasswordResetToken = (
  userId: number,
  secret: string,
  expiresIn: string,
) => {
  return sign({ userId }, secret, { expiresIn });
};
