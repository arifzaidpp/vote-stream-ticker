import { PERMISSIONS } from '../constants/permission.constants';

/**
 * Check if a permission is valid
 */
export const isValidPermission = (permission: string): boolean => {
  return Object.values(PERMISSIONS).includes(permission);
};

/**
 * Validate an array of permissions
 */
export const validatePermissions = (permissions: string[]): boolean => {
  return permissions.every(isValidPermission);
};

/**
 * Check if an admin has a specific permission
 */
export const checkAdminPermission = (
  admin: any,
  permission: string,
): boolean => {
  if (!admin || !admin.adminRoles) {
    return false;
  }

  // Get active roles
  const activeRoles = admin.adminRoles.filter(
    (role) => !role.endDate || new Date(role.endDate) > new Date(),
  );

  // Check if any role has the required permission
  return activeRoles.some((adminRole) =>
    adminRole.role.permissions.includes(permission),
  );
};

/**
 * Get all permissions for an admin
 */
export const getAdminPermissions = (admin: any): string[] => {
  if (!admin || !admin.adminRoles) {
    return [];
  }

  // Get active roles
  const activeRoles = admin.adminRoles.filter(
    (role) => !role.endDate || new Date(role.endDate) > new Date(),
  );

  // Get all permissions from active roles
  const permissions = new Set<string>();

  activeRoles.forEach((adminRole) => {
    adminRole.role.permissions.forEach((permission) => {
      permissions.add(permission);
    });
  });

  return Array.from(permissions);
};
