import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => {
  // Get the rate limit settings from environment
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS as string, 10) || 15 * 60 * 1000; // 15 minutes
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX as string, 10) || 1000000000; // 1 billion
  
  // Convert windowMs to TTL in seconds for throttler
  const ttl = Math.floor(windowMs / 1000);
  
  return {
    ttl,
    limit: maxRequests,
    // Route-specific limits
    auth: {
      ttl,
      limit: Math.max(5, Math.floor(maxRequests * 0.05)), // 5% of max requests for auth endpoints (min 5)
    },
    // IP whitelist (for admins or internal services)
    whitelist: process.env.THROTTLE_WHITELIST?.split(',') || [],
  };
});