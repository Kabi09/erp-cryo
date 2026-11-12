# Change Register — Cryo Scientific ERP

| Change ID | Date | Module | Layer | Summary of Modifications |
|---|---|---|---|---|
| CHG-001 | 2026-11-12 | Architecture | System | Documentation-First setup: `AI_INSTRUCTIONS.md`, `AGENTS.md`, `project.md`, `README.md`, `docs/` |
| CHG-002 | 2026-11-12 | Database | Backend | Mongoose models created: User, Customer, Product, Enquiry, Estimation, FollowUp, LeadDecision, Quotation, Negotiation, ProformaInvoice, CustomerPurchaseOrder, PaymentReceipt, SalesOrder, Notification, AuditLog, Counter |
| CHG-003 | 2026-11-12 | Auth & Security | Backend | Implemented JWT stateless token authentication and RBAC gatekeeper covering 10 staff roles |
| CHG-004 | 2026-11-12 | PDF Generation | Backend | Created `pdfService.js` using PDFKit with Cryo Scientific Systems branding for Quotations, PIs, and Sales Orders |
| CHG-005 | 2026-11-12 | Seed Engine | Backend | Populated database with multi-role staff, scientific equipment catalog, clients, and end-to-end workflow history |
| CHG-006 | 2026-11-12 | Core Frontend | Frontend | Set up React 18 + Vite (JavaScript only), Tailwind CSS, Lucide icons, Recharts, and Axios API client |
| CHG-007 | 2026-11-12 | Layout & Nav | Frontend | Built modern corporate business ERP layout with responsive Sidebar, Header with unread notifications feed, and quick role switcher on login |
| CHG-008 | 2026-11-12 | Dashboard UI | Frontend | Interactive Sales & Marketing dashboard with 14 summary metric cards and 4 Recharts visual trends |
| CHG-009 | 2026-11-12 | Workflows 1-10 | Frontend | Implemented all 10 workflow modules with modals, dynamic line items, approval gates, and 3-way reconciliation |
| CHG-010 | 2026-11-12 | Reports & RBAC | Frontend | 8 operational registers with CSV export and staff role governance |
