const ROLES = {
  SUPERADMIN: 'superadmin',
  SALESADMIN: 'salesadmin',
  ACCOUNTADMIN: 'accountadmin',
  STOREADMIN: 'storeadmin',
  LOGISTICSADMIN: 'logisticsadmin',
  RANDDADMIN: 'randdadmin',
  SERVICEADMIN: 'serviceadmin',
  SERVICEPERSON: 'serviceperson',
  PRODUCTIONADMIN: 'productionadmin',
  MARKETINGADMIN: 'marketingadmin',
};

const DEPARTMENTS = {
  MANAGEMENT: 'management',
  SALES: 'sales',
  ACCOUNTS: 'accounts',
  STORE: 'store',
  LOGISTICS: 'logistics',
  RANDD: 'randd',
  SERVICE: 'service',
  PRODUCTION: 'production',
  MARKETING: 'marketing',
};

const ROLE_DEPARTMENT_MAP = {
  [ROLES.SUPERADMIN]: DEPARTMENTS.MANAGEMENT,
  [ROLES.SALESADMIN]: DEPARTMENTS.SALES,
  [ROLES.ACCOUNTADMIN]: DEPARTMENTS.ACCOUNTS,
  [ROLES.STOREADMIN]: DEPARTMENTS.STORE,
  [ROLES.LOGISTICSADMIN]: DEPARTMENTS.LOGISTICS,
  [ROLES.RANDDADMIN]: DEPARTMENTS.RANDD,
  [ROLES.SERVICEADMIN]: DEPARTMENTS.SERVICE,
  [ROLES.SERVICEPERSON]: DEPARTMENTS.SERVICE,
  [ROLES.PRODUCTIONADMIN]: DEPARTMENTS.PRODUCTION,
  [ROLES.MARKETINGADMIN]: DEPARTMENTS.MARKETING,
};

const DEPARTMENT_ADMIN_ROLES = [
  ROLES.SALESADMIN,
  ROLES.ACCOUNTADMIN,
  ROLES.STOREADMIN,
  ROLES.LOGISTICSADMIN,
  ROLES.RANDDADMIN,
  ROLES.SERVICEADMIN,
  ROLES.PRODUCTIONADMIN,
  ROLES.MARKETINGADMIN,
];

const ALL_ROLES = Object.values(ROLES);
const ALL_DEPARTMENTS = Object.values(DEPARTMENTS);

const isSuperAdmin = (role) => role === ROLES.SUPERADMIN;

const isDepartmentAdmin = (role) => DEPARTMENT_ADMIN_ROLES.includes(role);

const getDepartmentForRole = (role) => ROLE_DEPARTMENT_MAP[role] || null;

const getRolesForDepartment = (dept) => {
  return Object.entries(ROLE_DEPARTMENT_MAP)
    .filter(([, department]) => department === dept)
    .map(([role]) => role);
};

module.exports = {
  ROLES,
  DEPARTMENTS,
  ROLE_DEPARTMENT_MAP,
  DEPARTMENT_ADMIN_ROLES,
  ALL_ROLES,
  ALL_DEPARTMENTS,
  isSuperAdmin,
  isDepartmentAdmin,
  getDepartmentForRole,
  getRolesForDepartment,
};
