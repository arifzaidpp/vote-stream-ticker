import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // Database connection URL
  url: process.env.DATABASE_URL,
  
  // Connection pool settings
  poolMin: parseInt(process.env.DATABASE_POOL_MIN as string, 10) || 1,
  poolMax: parseInt(process.env.DATABASE_POOL_MAX as string, 10) || 10,
  
  // Debug mode for development
  debug: process.env.DATABASE_DEBUG === 'true',
  
  // Migrations
  runMigrations: process.env.RUN_MIGRATIONS === 'true',
  
  // Seeding
  seed: process.env.SEED_DATABASE === 'true',
  
  // PostgreSQL extensions
  extensions: ['pgcrypto', 'postgis', 'pg_trgm'],

  // Prisma client settings
  clean_db: process.env.CLEAN_DB === 'true',
  log: ['query', 'info', 'warn', 'error'],
}));