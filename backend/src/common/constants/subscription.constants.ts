export enum SubscriptionPlanType {
  FREE = 'free',
  PREMIUM = 'premium',
  PREMIUM_PLUS = 'premium_plus',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  BIANNUAL = 'biannual',
  ANNUAL = 'annual',
}

export enum ContentAccess {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  PREMIUM_PLUS = 'premium_plus',
  SPECIAL_SUBSCRIPTION = 'special_subscription',
}

export const SUBSCRIPTION_PLAN_FEATURES = {
  [SubscriptionPlanType.FREE]: {
    accessToFreeContent: true,
    commentsAndReactions: true,
    bookmarks: true,
    articleLimit: 5,
  },
  [SubscriptionPlanType.PREMIUM]: {
    accessToFreeContent: true,
    accessToBasicContent: true,
    accessToPremiumContent: true,
    commentsAndReactions: true,
    bookmarks: true,
    articleLimit: null,
    downloadPDF: true,
    adFree: true,
  },
  [SubscriptionPlanType.PREMIUM_PLUS]: {
    accessToFreeContent: true,
    accessToBasicContent: true,
    accessToPremiumContent: true,
    accessToPremiumPlusContent: true,
    commentsAndReactions: true,
    bookmarks: true,
    articleLimit: null,
    downloadPDF: true,
    adFree: true,
    specialIssueAccess: true,
  },
};

export const DEFAULT_CURRENCY = 'INR';
