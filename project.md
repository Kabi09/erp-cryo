# Cryo EMS — Project Overview

## 1. Project Information
- **Project Name:** Cryo Enterprise Management System (EMS)
- **Domain:** Enterprise Resource Planning & Departmental Governance
- **Tech Stack:** MERN (MongoDB, Express.js, React, Node.js)
- **Language:** JavaScript Only (ES6+, No TypeScript)
- **Architecture:** Client-Server Monorepo / Decoupled Frontend & Backend
- **Authentication:** Stateless JWT + bcrypt password hashing + localStorage token storage
- **Authorization:** Granular Role-Based Access Control (RBAC) with Department Scoping

## 2. Technology Stack & Versions
- **Backend:** Node.js, Express 4.x, Mongoose 8.x, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `helmet`, `morgan`, `express-validator`
- **Frontend:** React 18.x, Vite 5.x, React Router v6 (`react-router-dom`), Axios
- **Database:** MongoDB (Default: `mongodb://localhost:27017/cryo_ems`)

## 3. RBAC Structure
### 10 Roles Supported:
1. `superadmin` — Full cross-department authority (View/Create/Edit/Deactivate all employees)
2. `salesadmin` — Sales Department Admin
3. `accountadmin` — Accounts Department Admin
4. `storeadmin` — Supply Chain & Stores Department Admin
5. `logisticsadmin` — Logistics Department Admin
6. `randdadmin` — Research & Development Admin
7. `serviceadmin` — Service Department Admin
8. `serviceperson` — Field Service Technician (Limited to self-profile access)
9. `productionadmin` — Production Department Admin
10. `marketingadmin` — Marketing Department Admin

### 9 Departments Supported:
`management`, `sales`, `accounts`, `store`, `logistics`, `randd`, `service`, `production`, `marketing`

## 4. Current Status (Phase 1)
- [x] **Authentication**: JWT login with email + password, token storage in localStorage
- [x] **RBAC Helper Utilities**: Extensible `roles.js` and `permissions.js` on backend and `roles.js` on frontend
- [x] **Employee Data Model**: Name, email, phone, hashed password (`select: false`), role, department, isActive, timestamps
- [x] **Employee CRUD API**: Scoped filtering and permission middleware
- [x] **Database Seeding**: Superadmin auto-seeder (`superadmin@cryo.com` / `SuperAdmin@123`)
- [x] **Login UI/UX**: Split-screen responsive design, navy blue theme with animated floating orbs, password visibility toggle, accessible focus rings, loading states
- [x] **Dashboard UI**: Role-aware metrics and governance cards
- [x] **Employee Management UI**: Search, department filtering, status toggling, and right-slide add/edit drawer

## 5. Port Configuration
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

