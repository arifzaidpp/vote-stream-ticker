import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  // RazorPay configuration
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  
  // Default currency
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'INR',
  
  // Payment settings
  autoCapture: process.env.PAYMENT_AUTO_CAPTURE === 'true',
  
  // Subscription settings
  subscriptions: {
    standardPlanId: process.env.STANDARD_PLAN_ID,
    premiumPlanId: process.env.PREMIUM_PLAN_ID,
    premiumPlusId: process.env.PREMIUM_PLUS_ID,
  },
  
  // Webhook configuration
  webhook: {
    enabled: process.env.PAYMENT_WEBHOOK_ENABLED === 'true',
    path: process.env.PAYMENT_WEBHOOK_PATH || '/api/subscription/webhook',
    ipWhitelist: process.env.PAYMENT_WEBHOOK_IP_WHITELIST?.split(',') || [],
  },
  
  // Notification settings
  notifications: {
    enabled: process.env.PAYMENT_NOTIFICATIONS_ENABLED === 'true',
    emailOnSuccess: process.env.EMAIL_ON_PAYMENT_SUCCESS === 'true',
    emailOnFailure: process.env.EMAIL_ON_PAYMENT_FAILURE === 'true',
  },
}));