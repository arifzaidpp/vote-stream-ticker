import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  // SMTP settings
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT as string, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  
  // Email defaults
  from: process.env.EMAIL_FROM || 'no-reply@thelicham.com',
  fromName: process.env.EMAIL_FROM_NAME || 'Thelicham Webzine',
  
  // Template settings
  templatesDir: process.env.EMAIL_TEMPLATES_DIR || './templates/email',
  
  // Features
  enableVerification: process.env.EMAIL_VERIFICATION_ENABLED === 'true',
  enablePasswordReset: process.env.PASSWORD_RESET_ENABLED === 'true',
  
  // Timeouts (in seconds)
  verificationTokenExpiry: parseInt(process.env.VERIFICATION_TOKEN_EXPIRY as string, 10) || 86400, // 24 hours
  passwordResetTokenExpiry: parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY as string, 10) || 3600, // 1 hour
  
  // Rate limiting
  rateLimitPerHour: parseInt(process.env.EMAIL_RATE_LIMIT_PER_HOUR as string, 10) || 5,
}));