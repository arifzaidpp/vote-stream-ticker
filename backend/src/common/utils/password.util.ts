import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';


const configService = new ConfigService();
const SECRET_PEPPER = configService.get<string>('passwordPepper');

/**
 * Hash a password using Argon2 with optimized settings for a low-RAM server.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password + SECRET_PEPPER, {
    type: argon2.argon2id, // Best security option
    memoryCost: 2 ** 14, // 16MB memory usage (adjustable)
    timeCost: 3, // Moderate security without high CPU usage
    parallelism: 1, // Single-threaded for efficiency
  });
};

/**
 * Verify a password against a hash using Argon2.
 */
export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
  return await argon2.verify(hash, password + SECRET_PEPPER);
};
