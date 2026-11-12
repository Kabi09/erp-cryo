# Cryo EMS — Enterprise Management System

Production-ready MERN stack application built with JavaScript (No TypeScript), modern navy blue UI/UX, and flexible Role-Based Access Control (RBAC).

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.x or newer recommended)
- **MongoDB** running locally on port 27017 (or MongoDB Atlas URI)

---

### 2. Backend Setup & Run

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your `.env` configuration (created automatically):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cryo_ems
   JWT_SECRET=cryo-ems-jwt-secret-key-2024-change-in-production
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```
4. Seed the initial Super Admin (optional; automatically executed on server start):
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *The server runs on http://localhost:5000*

---

### 3. Frontend Setup & Run

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open on http://localhost:5173*

---

## Seeded Superadmin Credentials

| Field | Value |
|---|---|
| **Email** | `superadmin@cryo.com` |
| **Password** | `SuperAdmin@123` |
| **Role** | `superadmin` |
| **Department** | `management` |

---

## Architecture Overview

```
cryo/
├── backend/
│   ├── config/          # Environment and MongoDB configuration
│   ├── controllers/     # authController and employeeController
│   ├── middleware/      # auth (verifyToken), rbac (authorize), errorHandler
│   ├── models/          # Mongoose Employee model with bcrypt pre-save
│   ├── routes/          # authRoutes and employeeRoutes with express-validator
│   ├── utils/           # roles.js, permissions.js, apiResponse, apiError
│   ├── seed.js          # Auto-seeder for superadmin
│   └── server.js        # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, ProtectedRoute
│   │   ├── context/     # AuthContext (login, logout, token persistence)
│   │   ├── pages/       # Login.jsx (split-screen navy UI), Dashboard, Employees
│   │   ├── utils/       # api.js (axios instance + JWT interceptor), roles.js
│   │   ├── App.jsx      # React Router definition
│   │   ├── index.css    # Modern design system & animations
│   │   └── main.jsx     # App mounting
│   ├── index.html       # Inter font & root element
│   └── vite.config.js   # Port 5173 configuration
│
└── docs/                # Task tracking, feature registry, and change history
```

---

## RBAC Rules

1. **`superadmin`**:
   - Full visibility and modification rights across all 9 departments.
   - Can recruit, edit, promote, and deactivate employees in any department.

2. **Department Admins** (`salesadmin`, `accountadmin`, `storeadmin`, `logisticsadmin`, `randdadmin`, `serviceadmin`, `productionadmin`, `marketingadmin`):
   - Scoped strictly to their assigned department.
   - Cannot view, add, or edit employees outside their department.
   - Cannot elevate employees to `superadmin`.

3. **`serviceperson`**:
   - Very limited access: can only view their own profile via `/api/employees/me`.

