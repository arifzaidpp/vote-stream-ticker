import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Application environment
  environment: process.env.NODE_ENV || 'development',
  
  // Server configuration
  port: parseInt(process.env.PORT as string, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  
  // URLs
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // CORS settings
  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS as string, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX as string, 10) || 100, // limit each IP to 100 requests per windowMs
  },
  
  // Localization
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'ml',
  supportedLanguages: process.env.SUPPORTED_LANGUAGES?.split(',') || ['ml', 'en'],
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
  
  // Security
  trustProxy: process.env.TRUST_PROXY === 'true',
  helmet: process.env.USE_HELMET === 'true',
}));