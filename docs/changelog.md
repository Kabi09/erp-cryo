# Changelog — Cryo Scientific ERP

All notable changes to the Cryo Scientific Systems Pvt. Ltd. ERP application are documented in this file.

## [1.0.0] — 2026-11-12

### Initial Release
- Implemented full MERN stack Enquiry to Sales Order (SO) Management System for Cryo Scientific Systems Pvt. Ltd.
- Built backend REST APIs with MVC architecture, JWT auth, RBAC for 10 distinct staff roles, and audit logging.
- Engineered automated corporate PDF document generator using PDFKit for Quotations, Proforma Invoices, and Sales Orders.
- Built complete Frontend using pure JavaScript (React 18 + Vite, Tailwind CSS, Lucide icons, Recharts).
- Implemented all 10 business workflow modules:
  - Executive Dashboard with 14 live MongoDB metric cards and 4 Recharts visual trends
  - Customer Master with multi-address management and transaction history
  - Product Master & Cryogenic Equipment Specifications
  - Customer Enquiry Management with dynamic multi-product line items
  - Internal BOM Cost Estimation with dynamic costing breakdown and margin calculation
  - Follow-up Management with multi-channel logging and scheduling
  - Lead Won / Lost analytics
  - Multi-version Quotation Management (V1, V2, ...)
  - Customer Negotiation and manager approval loops
  - Proforma Invoice generation with advance/balance split
  - Customer PO Receiving with 3-Way Reconciliation verification
  - Payment Receipts with Accounts department verification gate
  - Sales Order Management with 5-stage departmental approvals and plant release
  - Operational Reports with date filtering and CSV / Print exports
  - Staff User Management & Role Governance
- Created comprehensive seed script with realistic Cryo Scientific data across staff, products, clients, and active orders.
