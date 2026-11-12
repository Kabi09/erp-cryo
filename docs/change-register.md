# Cryo EMS — Change Register

## CHG-001: Initial Architecture & Phase 1 Implementation
- **Date:** 2026-11-12
- **Task ID:** TASK-001
- **Feature IDs:** FEAT-001, FEAT-002, FEAT-003
- **Summary:** Built complete MERN stack foundation with JWT auth, 10-role RBAC, Employee CRUD, auto-seeding, and responsive React frontend.

### Files Created
1. `backend/server.js`: Express server initialization, middleware setup, route mounting.
2. `backend/config/index.js`, `backend/config/db.js`: Environment configuration and MongoDB connection.
3. `backend/models/Employee.js`: Mongoose model with 10 roles, 9 departments, bcrypt hashing.
4. `backend/utils/roles.js`: Core role constants, department mappings, and helper predicates.
5. `backend/utils/permissions.js`: Permission mapping and `hasPermission` evaluator.
6. `backend/utils/apiResponse.js`, `backend/utils/apiError.js`: Standardized response formatting.
7. `backend/middleware/auth.js`: JWT token verification and active status assertion.
8. `backend/middleware/rbac.js`: Role authorization middleware.
9. `backend/controllers/authController.js`: Login endpoint handler.
10. `backend/controllers/employeeController.js`: Role-scoped Employee CRUD operations.
11. `backend/routes/authRoutes.js`, `backend/routes/employeeRoutes.js`: Validated route definitions.
12. `backend/seed.js`: Initial Super Admin account seeder.
13. `frontend/src/pages/Login.jsx`, `frontend/src/pages/Login.css`: Split-screen navy UI with floating orbs and responsive layout.
14. `frontend/src/context/AuthContext.jsx`: Authentication state, token persistence, and login/logout methods.
15. `frontend/src/utils/api.js`: Axios instance with Bearer token interceptor and 401 handling.
16. `frontend/src/utils/roles.js`: Frontend roles and department labels.
17. `frontend/src/components/ProtectedRoute.jsx`: Role-protected route wrapper.
18. `frontend/src/components/Layout.jsx`, `frontend/src/components/Layout.css`: Responsive sidebar and topbar layout.
19. `frontend/src/pages/Dashboard.jsx`: Role-aware metrics and governance dashboard.
20. `frontend/src/pages/Employees.jsx`: Employee directory, filtering, status toggling, and right-slide drawer.
21. `frontend/src/App.jsx`: Route definitions.
22. `frontend/src/index.css`: Global styles and modern design tokens.

