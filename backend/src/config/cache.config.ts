// cache.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  // NestJS Cache configuration
  ttl: parseInt(process.env.CACHE_TTL as string, 10) || 300, // 5 minutes in seconds as default
  max: parseInt(process.env.CACHE_MAX_ITEMS as string, 10) || 100, // Maximum number of items in cache
  
  // Cache options
  enabled: process.env.CACHE_ENABLED === 'true',
  
  // Cache TTL by type (in seconds)
  ttlSettings: {
    content: parseInt(process.env.CACHE_CONTENT_TTL as string, 10) || 3600, // 1 hour
    user: parseInt(process.env.CACHE_USER_TTL as string, 10) || 1800, // 30 minutes
    category: parseInt(process.env.CACHE_CATEGORY_TTL as string, 10) || 86400, // 24 hours
    tag: parseInt(process.env.CACHE_TAG_TTL as string, 10) || 86400, // 24 hours
    settings: parseInt(process.env.CACHE_SETTINGS_TTL as string, 10) || 86400, // 24 hours
  },
  
  // Cache key strategies
  keys: {
    content: (id) => `content:${id}`,
    contentBySlug: (slug) => `content:slug:${slug}`,
    user: (id) => `user:${id}`,
    userByEmail: (email) => `user:email:${email}`,
    category: (id) => `category:${id}`,
    categoryBySlug: (slug) => `category:slug:${slug}`,
    tag: (id) => `tag:${id}`,
    tagBySlug: (slug) => `tag:slug:${slug}`,
    settings: (key) => `settings:${key}`,
  },
}));