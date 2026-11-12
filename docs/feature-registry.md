# Cryo EMS — Feature Registry

## FEAT-001: JWT Authentication
- **Status:** COMPLETED
- **Description:** Secure login mechanism utilizing email and password with bcrypt comparison and JSON Web Tokens.
- **Components:** `backend/controllers/authController.js`, `backend/routes/authRoutes.js`, `frontend/src/pages/Login.jsx`, `frontend/src/context/AuthContext.jsx`
- **Endpoints:** `POST /api/auth/login`

## FEAT-002: Role-Based Access Control (RBAC) System
- **Status:** COMPLETED
- **Description:** Granular permission system supporting 10 distinct roles and 9 departments with strict scoping rules.
- **Components:** `backend/utils/roles.js`, `backend/utils/permissions.js`, `backend/middleware/rbac.js`, `frontend/src/utils/roles.js`
- **Supported Roles:**
  - `superadmin`: Unrestricted access across all departments.
  - Department Admins (`salesadmin`, `accountadmin`, `storeadmin`, `logisticsadmin`, `randdadmin`, `serviceadmin`, `productionadmin`, `marketingadmin`): Scoped to own department.
  - `serviceperson`: Minimal self-service permissions.

## FEAT-003: Employee Directory & Governance
- **Status:** COMPLETED
- **Description:** Complete employee directory with creation, editing, departmental scoping, and active/inactive toggles.
- **Components:** `backend/models/Employee.js`, `backend/controllers/employeeController.js`, `backend/routes/employeeRoutes.js`, `frontend/src/pages/Employees.jsx`
- **Endpoints:**
  - `GET /api/employees` (filtered by department for dept admins)
  - `GET /api/employees/me` (all roles)
  - `GET /api/employees/:id` (scoped)
  - `POST /api/employees` (scoped)
  - `PUT /api/employees/:id` (scoped)
  - `PATCH /api/employees/:id/toggle-active` (scoped)

