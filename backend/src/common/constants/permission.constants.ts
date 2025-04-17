  /**
   * Thelicham Webzine Permission Constants
   * This file defines all permissions available in the system.
   * Used for role-based access control (RBAC) and authorization.
   */

  // User Management Permissions
  export const USER_PERMISSIONS = {
    VIEW_USERS: 'user:view',
    CREATE_USER: 'user:create',
    UPDATE_USER: 'user:update',
    DELETE_USER: 'user:delete',
    MANAGE_USER_ROLES: 'user:manage-roles',
  };

  export const ADMIN_PERMISSIONS = {
    VIEW_ADMINS: 'admin:view',
    CREATE_ADMIN: 'admin:create',
    UPDATE_ADMIN: 'admin:update',
    DELETE_ADMIN: 'admin:delete',
    MANAGE_ADMIN_ROLES: 'admin:manage-roles',
  };

  // Role Management Permissions
  export const ROLE_PERMISSIONS = {
    VIEW_ROLES: 'role:view',
    CREATE_ROLE: 'role:create',
    UPDATE_ROLE: 'role:update',
    DEACTIVATE_ROLE: 'role:deactivate',
    ASSIGN_ROLE: 'role:assign',
    REMOVE_ROLE: 'role:remove',
  };

  // Content Management Permissions
  export const CONTENT_PERMISSIONS = {
    // General content permissions
    VIEW_CONTENT: 'content:view',
    CREATE_CONTENT: 'content:create',
    UPDATE_CONTENT: 'content:update',
    DELETE_CONTENT: 'content:delete',
    PUBLISH_CONTENT: 'content:publish',
    UNPUBLISH_CONTENT: 'content:unpublish',
    REMOVE_CONTENT: 'content:remove',

    // Category permissions
    MANAGE_CATEGORIES: 'content:manage-categories',
    REMOVE_CATEGORY: 'content:remove-category',

    // Tag permissions
    MANAGE_TAGS: 'content:manage-tags',
    REMOVE_TAG: 'content:remove-tag',

    // Author permissions
    MANAGE_AUTHORS: 'content:manage-authors',
    REMOVE_AUTHOR: 'content:remove-author',

    // Media permissions
    UPLOAD_MEDIA: 'content:upload-media',
    DELETE_MEDIA: 'content:delete-media',
    MANAGE_MEDIA: 'content:manage-media',

    // Packet permissions
    MANAGE_PACKETS: 'content:manage-packets',
    PUBLISH_PACKET: 'content:publish-packet',
    REMOVE_PACKET: 'content:remove-packet',

    // Series permissions
    MANAGE_SERIES: 'content:manage-series',
    REMOVE_SERIES: 'content:remove-series',

    // Content revision permissions
    VIEW_CONTENT_REVISIONS: 'content:view-revisions',
    CREATE_CONTENT_REVISION: 'content:create-revision',
    REMOVE_CONTENT_REVISION: 'content:remove-revision',

    //Author type permissions
    MANAGE_AUTHOR_TYPES: 'content:manage-author-types',
    REMOVE_AUTHOR_TYPE: 'content:remove-author-type',
  };

  // Editorial Workflow Permissions
  export const EDITORIAL_PERMISSIONS = {
    VIEW_WORKFLOW: 'editorial:view-workflow',
    UPDATE_WORKFLOW: 'editorial:update-workflow',
    ASSIGN_EDITORS: 'editorial:assign-editors',
    APPROVE_CONTENT: 'editorial:approve-content',
    REJECT_CONTENT: 'editorial:reject-content',
  };

  // Comment Management Permissions
  export const COMMENT_PERMISSIONS = {
    VIEW_COMMENTS: 'comment:view',
    APPROVE_COMMENTS: 'comment:approve',
    DELETE_COMMENTS: 'comment:delete',
    REPLY_TO_COMMENTS: 'comment:reply',
  };

  // Subscription Management Permissions
  export const SUBSCRIPTION_PERMISSIONS = {
    VIEW_SUBSCRIPTIONS: 'subscription:view',
    CREATE_SUBSCRIPTION: 'subscription:create',
    UPDATE_SUBSCRIPTION: 'subscription:update',
    DELETE_SUBSCRIPTION: 'subscription:delete',
    MANAGE_SUBSCRIPTION: 'subscription:manage',
  };

  // Payment Management Permissions
  export const PAYMENT_PERMISSIONS = {
    VIEW_PAYMENTS: 'payment:view',
    PROCESS_PAYMENTS: 'payment:process',
    ISSUE_REFUNDS: 'payment:refund',
    VIEW_PAYMENT_REPORTS: 'payment:view-reports',
  };

  // Analytics Permissions
  export const ANALYTICS_PERMISSIONS = {
    VIEW_ANALYTICS: 'analytics:view',
    EXPORT_ANALYTICS: 'analytics:export',
    VIEW_USER_ANALYTICS: 'analytics:view-user',
    VIEW_CONTENT_ANALYTICS: 'analytics:view-content',
    VIEW_REVENUE_ANALYTICS: 'analytics:view-revenue',
  };

  // System Management Permissions
  export const SYSTEM_PERMISSIONS = {
    CREATE_SYSTEM_SETTINGS: 'system:create-settings',
    VIEW_SYSTEM_SETTINGS: 'system:view-settings',
    UPDATE_SYSTEM_SETTINGS: 'system:update-settings',
    DELETE_SYSTEM_SETTINGS: 'system:delete-settings',
    VIEW_AUDIT_LOGS: 'system:view-audit-logs',
    MANAGE_CACHING: 'system:manage-caching',
    MANAGE_BACKUP: 'system:manage-backup',
  };

  // User Submission Permissions
  export const SUBMISSION_PERMISSIONS = {
    VIEW_SUBMISSIONS: 'submission:view',
    APPROVE_SUBMISSIONS: 'submission:approve',
    REJECT_SUBMISSIONS: 'submission:reject',
    CONVERT_SUBMISSION_TO_CONTENT: 'submission:convert-to-content',
    MANAGE_SUBMISSIONS: 'submission:manage',
  };

  // Admin Action History Permissions
  export const ADMIN_ACTION_HISTORY_PERMISSIONS = {
    VIEW_ADMIN_ACTION_HISTORY: 'admin-action-history:view',
    VIEW_ADMIN_ACTION_HISTORY_BY_USER: 'admin-action-history:view-by-user',
    VIEW_ADMIN_ACTION_HISTORY_BY_CONTENT: 'admin-action-history:view-by-content',
    VIEW_ADMIN_ACTION_HISTORY_BY_CATEGORY: 'admin-action-history:view-by-category',
    VIEW_ADMIN_ACTION_HISTORY_BY_TAG: 'admin-action-history:view-by-tag',
    VIEW_ADMIN_ACTION_HISTORY_BY_AUTHOR: 'admin-action-history:view-by-author',
    VIEW_ADMIN_ACTION_HISTORY_BY_MEDIA: 'admin-action-history:view-by-media',
    VIEW_ADMIN_ACTION_HISTORY_BY_PACKET: 'admin-action-history:view-by-packet',
    VIEW_ADMIN_ACTION_HISTORY_BY_SERIES: 'admin-action-history:view-by-series',
    VIEW_ADMIN_ACTION_HISTORY_BY_REVISION: 'admin-action-history:view-by-revision',
    VIEW_ADMIN_ACTION_HISTORY_BY_COMMENT: 'admin-action-history:view-by-comment',
    VIEW_ADMIN_ACTION_HISTORY_BY_SUBSCRIPTION: 'admin-action-history:view-by-subscription',
    VIEW_ADMIN_ACTION_HISTORY_BY_SYSTEM: 'admin-action-history:view-by-system',
    VIEW_ADMIN_ACTION_HISTORY_BY_SUBMISSION: 'admin-action-history:view-by-submission',
  };

  export const ALL_PERMISSIONS = {
    ALL : 'all',
  };

  // Combine all permissions for easy reference
  export const PERMISSIONS = {
    ...ALL_PERMISSIONS,
    ...USER_PERMISSIONS,
    ...CONTENT_PERMISSIONS,
    ...EDITORIAL_PERMISSIONS,
    ...COMMENT_PERMISSIONS,
    ...SUBSCRIPTION_PERMISSIONS,
    ...PAYMENT_PERMISSIONS,
    ...ANALYTICS_PERMISSIONS,
    ...SYSTEM_PERMISSIONS,
    ...SUBMISSION_PERMISSIONS,
    ...ROLE_PERMISSIONS,
    ...ADMIN_PERMISSIONS,
    ...ADMIN_ACTION_HISTORY_PERMISSIONS,
  };

  const PERMISSION_VALUES = Object.values(PERMISSIONS);

// Function to generate a valid GraphQL enum key from permission string
function generateEnumKey(permission: string) {
  // Replace all special characters with underscore
  let key = permission.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  // If it starts with a number, prefix with an underscore
  if (/^[0-9]/.test(key)) {
    key = `_${key}`;
  }
  return key;
}

export const PermissionEnum = {} as any;

PERMISSION_VALUES.forEach((value) => {
  const enumKey = generateEnumKey(value);
  PermissionEnum[enumKey] = value;
});

