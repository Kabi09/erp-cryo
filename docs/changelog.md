# Changelog

## [1.0.0] - 2026-11-12
### Added
- Complete backend with Node.js + Express + Mongoose + JWT + bcryptjs.
- 10 roles system: `superadmin`, `salesadmin`, `accountadmin`, `storeadmin`, `logisticsadmin`, `randdadmin`, `serviceadmin`, `serviceperson`, `productionadmin`, `marketingadmin`.
- 9 departments system: `management`, `sales`, `accounts`, `store`, `logistics`, `randd`, `service`, `production`, `marketing`.
- Scoped Employee CRUD API (`/api/employees`) with department boundaries.
- Authentication endpoint (`/api/auth/login`) returning JWT and employee profile.
- Superadmin seeder (`superadmin@cryo.com` / `SuperAdmin@123`).
- React (Vite) frontend with modern Navy Blue accent theme.
- Split-screen responsive login page with animated floating orbs, grid overlay, and password toggle.
- Role-based redirection and protected routes.
- Role-scoped Employee Management directory with drawer modal.

