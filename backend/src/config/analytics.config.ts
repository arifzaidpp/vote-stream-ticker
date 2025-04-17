import { registerAs } from '@nestjs/config';

export default registerAs('analytics', () => ({
  // Tracking settings
  trackPageViews: process.env.TRACK_PAGE_VIEWS === 'true',
  trackUserActivity: process.env.TRACK_USER_ACTIVITY === 'true',
  trackContentViews: process.env.TRACK_CONTENT_VIEWS === 'true',
  
  // User Analytics
  anonymizeIp: process.env.ANONYMIZE_IP === 'true',
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT as string, 10) || 1800, // 30 minutes in seconds
  
  // Data retention
  dataRetentionDays: parseInt(process.env.ANALYTICS_DATA_RETENTION_DAYS as string, 10) || 90,
  
  // Reporting
  scheduledReports: process.env.SCHEDULED_REPORTS === 'true',
  reportingEmail: process.env.REPORTING_EMAIL,
  
  // Integration
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  
  // Performance metrics
  trackPerformance: process.env.TRACK_PERFORMANCE === 'true',
}));