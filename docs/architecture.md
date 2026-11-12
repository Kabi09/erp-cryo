# System Architecture — Cryo Scientific ERP

## Overview
The Cryo Scientific Systems Pvt. Ltd. ERP is structured as a decoupled full-stack client-server architecture:
- **Frontend Client**: SPA powered by React 18 (pure JavaScript .jsx), Vite bundler, React Router v6, Tailwind CSS, Lucide React icons, and Recharts.
- **Backend API Server**: Node.js and Express.js REST application utilizing strict MVC design (Models, Views/Serializers, Controllers, Services, Middleware, Utilities).
- **Persistence Layer**: MongoDB database running locally on `localhost:27017/cryo_erp` with Mongoose ODM models.

```
+-----------------------------------------------------------------------------------+
|                           Client Browser / Mobile PWA                             |
|  [ React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts + React Hook Form ]    |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON REST APIs (Axios)
                                           v
+-----------------------------------------------------------------------------------+
|                         Express.js REST API Server (:5000)                        |
|  +-----------------------------------------------------------------------------+  |
|  | Middleware: Auth (JWT), RBAC Gatekeeper, Multer, Error Handler, Audit Logger |  |
|  +-----------------------------------------------------------------------------+  |
|  | Controllers & Services:                                                     |  |
|  |  - Auth & Users        - Enquiries            - Quotations & Versions       |  |
|  |  - Customer Master     - Estimations & Cost   - Proforma Invoices           |  |
|  |  - Product Master      - Follow-ups           - Customer POs & 3-Way Match  |  |
|  |  - Requirements        - Won / Lost Leads     - Payment Receipts & Accounts |  |
|  |  - Sales Orders & Multi-Department Approvals   - PDF Document Generator      |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | Mongoose ODM
                                           v
+-----------------------------------------------------------------------------------+
|                              MongoDB Database (:27017)                            |
|  Collections: Users, Customers, Products, Enquiries, Estimations, FollowUps,      |
|  Quotations, Negotiations, PIs, CustomerPOs, Payments, SalesOrders, Audits, etc.  |
+-----------------------------------------------------------------------------------+
```

## Security & Access Control
- JWT stateless bearer tokens with expiration.
- Passwords salted and hashed with bcryptjs (10 rounds).
- RBAC hierarchy enforcing role-specific gates across all REST endpoints.
- Role matrix: Super Admin, MD/Director, Sales Manager, Sales Executive, Estimation Engineer, Engineering Manager, Accounts Manager, Accounts Executive, Production Manager, Purchase Manager.
