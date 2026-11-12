# Cryo Scientific Systems Pvt. Ltd. – Enquiry to Sales Order (SO) Management System

## Project Overview
An end-to-end Enterprise Resource Planning (ERP) web application engineered for **Cryo Scientific Systems Pvt. Ltd.** to streamline, automate, and govern the full lifecycle from customer enquiry to sales order release for production.

Cryo Scientific Systems Pvt. Ltd. manufactures high-precision medical, scientific, and industrial refrigeration equipment, ultra-low temperature freezers, blood bank storage systems, plasma freezers, and environmental test chambers.

## Technology Stack
- **Frontend**: React 18+ (JavaScript only - `.js`/`.jsx`), Vite, React Router DOM v6, Tailwind CSS, Axios, Lucide React, Recharts, React Hook Form.
- **Backend**: Node.js, Express.js (MVC architecture), REST APIs.
- **Database**: MongoDB with Mongoose ODM (ObjectIds, indexes, transactions).
- **Authentication & Security**: JWT (JSON Web Tokens), bcryptjs password hashing, Role-Based Access Control (RBAC), express-validator / Zod.
- **Document Generation**: PDFKit / PDF generation service for Quotations, Proforma Invoices, and Sales Orders.
- **File Uploads**: Multer for attachments (drawings, technical specs, customer PO copies, payment proofs).

## Key Workflow Modules
1. **User Authentication & RBAC**: 10 functional roles with granular permissions and audit logging.
2. **Dashboard**: Executive and operational metrics, Recharts trends, conversion funnels, and real-time alerts.
3. **Customer Master**: Comprehensive customer database with multiple billing/shipping addresses, GST/PAN validation, contact persons, and transaction history.
4. **Product Master & Requirements**: Equipment catalog (ULT freezers, blood bank refrigerators, etc.) with standard specs and customer-specific customized engineering requirements.
5. **Customer Enquiry Management**: Auto-numbered (`ENQ-YYYY-0001`), multi-product dynamic line items, technical specifications, and attachment tracking.
6. **Cost Estimation**: Dynamic costing engine (raw materials, sensors, controllers, labour, testing, margin, GST) with revision history and approval gates.
7. **Follow-up Management**: Multi-channel interaction logs (Call, WhatsApp, Email, Meeting), calendar view, overdue alerts, and notifications.
8. **Lead Won / Lost Management**: Stage decisions, analytical loss reasons, and stage progression.
9. **Quotation Management**: Multi-version quotations (`QUO-YYYY-0001` V1, V2, ...), commercial terms, dynamic pricing, and PDF generation.
10. **Negotiation & Approval**: Discount requests, manager/director approval workflows, customer acceptance tracking.
11. **Proforma Invoice (PI)**: Commercial invoice generation (`PI-YYYY-0001`), payment milestone schedules, and bank details.
12. **Customer PO Verification**: Automated 3-way reconciliation (Accepted Quotation vs Company PI vs Customer PO) and discrepancy alerting.
13. **Payment Receipt Management**: Advance and milestone payments (`REC-YYYY-0001`), TDS, partial payments, payment proofs, and accounts verification.
14. **Sales Order (SO) Management**: Final execution document (`SO-YYYY-0001`), 5-stage inter-departmental approval workflow (Sales, Accounts, Technical, Feasibility, Management), and release for production.
15. **Reports & Exports**: 18 comprehensive registers and analytical reports with date/status filters and CSV/PDF/Print export.

## Documentation Index
- Architecture: `docs/architecture.md`
- Project Structure: `docs/project-structure.md`
- UI Standards: `docs/ui-standards.md`
- Reusable Components: `docs/reusable-components.md`
- Workflows: `docs/workflows.md`
- Business Logic: `docs/business-logic.md`
- Feature Registry: `docs/feature-registry.md`
- Task Tracker: `docs/task-tracker.md`
- API Index: `docs/api/api-index.md`
- Schema Overview: `docs/database/schema-overview.md`
- Decisions: `docs/decisions.md`
- Testing: `docs/testing.md`
- Change Register: `docs/change-register.md`
- Changelog: `docs/changelog.md`

## Status
- **Current State**: Initializing Full Implementation.
- **Environment**: Node.js v26.13.0, npm v11.6.2, MongoDB v8.0.4.
