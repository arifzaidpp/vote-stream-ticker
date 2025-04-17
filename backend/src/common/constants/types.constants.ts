export enum ContentType {
  ARTICLE = 'article',
  PODCAST = 'podcast',
  PHOTO_ESSAY = 'photo_essay',
  INTERVIEW = 'interview',
}

export enum SubscriptionPlanType {
  FREE = 'free',
  PREMIUM = 'premium',
  PREMIUM_PLUS = 'premium_plus',
}

export enum MilestoneType {
  REACTION = 'reaction',
  VIEW = 'view',
  SHARE = 'share',
  COMMENT = 'comment',
}

export enum LoginMethod {
  PASSWORD = 'password',
  GOOGLE = 'google',
}

export enum FileUploadType {
  FEATURE_IMAGE = 'feature_image',
  USER_AVATAR = 'user_avatar',
  ADMIN_AVATAR = 'admin_avatar',
  CONTENT_MEDIA = 'content_media',
  OTHER = 'other',
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  APPROVE = 'approve',
  REJECT = 'reject',
  LOGIN = 'login',
  LOGOUT = 'logout',
  VIEW = 'view',
  DOWNLOAD = 'download',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  ASSIGN = 'assign',
  REMOVE = 'remove',
  REQUEST_RESET = 'request-reset',
  RESET_PASSWORD = 'reset-password',
}

export enum Entity {
  USER = 'user',
  ADMIN = 'admin',
  CONTENT = 'content',
  CATEGORY = 'category',
  TAG = 'tag',
  PACKET = 'packet',
  SERIES = 'series',
  AUTHOR = 'author',
  SUBSCRIPTION = 'subscription',
  PAYMENT = 'payment',
  COMMENT = 'comment',
  SETTING = 'setting',
  MEDIA = 'media',
  SYSTEM = 'system',
  REVISION = 'revision',
  SUBMISSION = 'submission',
  ROLE = 'role',
  AUTHOR_TYPE = 'author_type',
  USER_SUBMISSION = 'user_submission',
}

export enum SystemSettingGroup {
  SITE = 'site',
  CONTENT = 'content',
  AUTH = 'auth',
  EMAIL = 'email',
  SUBSCRIPTION = 'subscription',
  PAYMENT = 'payment',
  SOCIAL = 'social',
  SEO = 'seo',
  ANALYTICS = 'analytics',
  NOTIFICATION = 'notification',
  MEDIA = 'media',
  CUSTOM = 'custom',
}
