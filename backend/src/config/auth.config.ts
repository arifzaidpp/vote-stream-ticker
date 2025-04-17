// src/config/auth.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // Password settings
  passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS as string, 10) || 10,
  passwordPepper: process.env.PASSWORD_PEPPER || 'your-secure-secret',
  
  // Google OAuth settings
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET,
    expiresIn: parseInt(process.env.SESSION_EXPIRES_IN as string, 10) || 86400, // 24 hours in seconds
  },
  
  // Rate limiting for auth endpoints
  rateLimit: {
    loginAttempts: parseInt(process.env.LOGIN_RATE_LIMIT as string, 10) || 5,
    windowMs: parseInt(process.env.LOGIN_RATE_WINDOW_MS as string, 10) || 15 * 60 * 1000, // 15 minutes
  },

  // Email verification and password reset
  emailVerification: {
    secret: process.env.EMAIL_VERIFICATION_SECRET || process.env.JWT_SECRET,
    expiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h',
  },
  passwordReset: {
    secret: process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET,
    expiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',
  },
}));