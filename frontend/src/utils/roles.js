/* ─── Roles ─── */
export const ROLES = {
  SUPERADMIN: 'superadmin',
  SALES_ADMIN: 'salesadmin',
  ACCOUNT_ADMIN: 'accountadmin',
  STORE_ADMIN: 'storeadmin',
  LOGISTICS_ADMIN: 'logisticsadmin',
  RANDD_ADMIN: 'randdadmin',
  SERVICE_ADMIN: 'serviceadmin',
  SERVICE_PERSON: 'serviceperson',
  PRODUCTION_ADMIN: 'productionadmin',
  MARKETING_ADMIN: 'marketingadmin',
};

/* ─── Departments ─── */
export const DEPARTMENTS = {
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

/* ─── Role → Department mapping ─── */
export const ROLE_DEPARTMENT_MAP = {
  [ROLES.SUPERADMIN]: DEPARTMENTS.MANAGEMENT,
  [ROLES.SALES_ADMIN]: DEPARTMENTS.SALES,
  [ROLES.ACCOUNT_ADMIN]: DEPARTMENTS.ACCOUNTS,
  [ROLES.STORE_ADMIN]: DEPARTMENTS.STORE,
  [ROLES.LOGISTICS_ADMIN]: DEPARTMENTS.LOGISTICS,
  [ROLES.RANDD_ADMIN]: DEPARTMENTS.RANDD,
  [ROLES.SERVICE_ADMIN]: DEPARTMENTS.SERVICE,
  [ROLES.SERVICE_PERSON]: DEPARTMENTS.SERVICE,
  [ROLES.PRODUCTION_ADMIN]: DEPARTMENTS.PRODUCTION,
  [ROLES.MARKETING_ADMIN]: DEPARTMENTS.MARKETING,
};

export const DEPARTMENT_ADMIN_ROLES = [
  ROLES.SALES_ADMIN,
  ROLES.ACCOUNT_ADMIN,
  ROLES.STORE_ADMIN,
  ROLES.LOGISTICS_ADMIN,
  ROLES.RANDD_ADMIN,
  ROLES.SERVICE_ADMIN,
  ROLES.PRODUCTION_ADMIN,
  ROLES.MARKETING_ADMIN,
];

/* ─── Helpers ─── */
export const isSuperAdmin = (role) => role === ROLES.SUPERADMIN;

export const isDepartmentAdmin = (role) => DEPARTMENT_ADMIN_ROLES.includes(role);

export const getDepartmentForRole = (role) => ROLE_DEPARTMENT_MAP[role] || null;

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  salesadmin: 'Sales Admin',
  accountadmin: 'Account Admin',
  storeadmin: 'Store Admin',
  logisticsadmin: 'Logistics Admin',
  randdadmin: 'R&D Admin',
  serviceadmin: 'Service Admin',
  serviceperson: 'Service Person',
  productionadmin: 'Production Admin',
  marketingadmin: 'Marketing Admin',
};

const DEPARTMENT_LABELS = {
  management: 'Management',
  sales: 'Sales',
  accounts: 'Accounts',
  store: 'Store',
  logistics: 'Logistics',
  randd: 'R&D',
  service: 'Service',
  production: 'Production',
  marketing: 'Marketing',
};

export const getRoleLabel = (role) => ROLE_LABELS[role] || role;

export const getDepartmentLabel = (dept) => DEPARTMENT_LABELS[dept] || dept;

export const ALL_ROLES = Object.values(ROLES);
export const ALL_DEPARTMENTS = Object.values(DEPARTMENTS);

/* ─── Sidebar items by role ─── */
const COMMON_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
];

const ADMIN_ITEMS = [
  ...COMMON_ITEMS,
  { label: 'Employees', path: '/employees', icon: 'employees' },
];

export const SIDEBAR_ITEMS_BY_ROLE = {
  [ROLES.SUPERADMIN]: ADMIN_ITEMS,
  [ROLES.SALES_ADMIN]: ADMIN_ITEMS,
  [ROLES.ACCOUNT_ADMIN]: ADMIN_ITEMS,
  [ROLES.STORE_ADMIN]: ADMIN_ITEMS,
  [ROLES.LOGISTICS_ADMIN]: ADMIN_ITEMS,
  [ROLES.RANDD_ADMIN]: ADMIN_ITEMS,
  [ROLES.SERVICE_ADMIN]: ADMIN_ITEMS,
  [ROLES.PRODUCTION_ADMIN]: ADMIN_ITEMS,
  [ROLES.MARKETING_ADMIN]: ADMIN_ITEMS,
  [ROLES.SERVICE_PERSON]: COMMON_ITEMS,
};
