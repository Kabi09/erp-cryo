const { ROLES, DEPARTMENT_ADMIN_ROLES } = require('./roles');

const PERMISSIONS = {
  EMPLOYEE_VIEW_ALL: 'employee:view_all',
  EMPLOYEE_VIEW_DEPT: 'employee:view_dept',
  EMPLOYEE_VIEW_SELF: 'employee:view_self',
  EMPLOYEE_CREATE: 'employee:create',
  EMPLOYEE_EDIT: 'employee:edit',
  EMPLOYEE_DELETE: 'employee:delete',
  EMPLOYEE_DEACTIVATE: 'employee:deactivate',
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: ['*'],
  [ROLES.SERVICEPERSON]: [PERMISSIONS.EMPLOYEE_VIEW_SELF],
};

// Assign department admin permissions
DEPARTMENT_ADMIN_ROLES.forEach((role) => {
  ROLE_PERMISSIONS[role] = [
    PERMISSIONS.EMPLOYEE_VIEW_DEPT,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_EDIT,
    PERMISSIONS.EMPLOYEE_DEACTIVATE,
  ];
});

/**
 * Check if a role has a specific permission.
 * Superadmin ('*') has all permissions.
 */
const hasPermission = (role, permission) => {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes('*')) return true;
  return perms.includes(permission);
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
};
