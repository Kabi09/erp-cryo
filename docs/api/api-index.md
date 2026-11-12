# API Index — Cryo Scientific ERP

All endpoints are prefixed with `/api` and require a valid Bearer JWT token in the `Authorization` header, except `/api/auth/login` and `/api/health`.

## 1. Authentication & Users
- `POST /api/auth/login`: Authenticate staff credentials, return JWT & profile.
- `GET /api/auth/me`: Get current authenticated user details.
- `PUT /api/auth/change-password`: Change user password.
- `GET /api/auth/users`: List all staff users.
- `POST /api/auth/users`: Register a new staff user (Super Admin / MD only).
- `PUT /api/auth/users/:id`: Update user role or active status.

## 2. Customer Master
- `GET /api/customers`: Search and list customer profiles.
- `GET /api/customers/:id`: Get single customer details.
- `POST /api/customers`: Register new customer with duplicate GSTIN/email check.
- `PUT /api/customers/:id`: Update customer details.
- `DELETE /api/customers/:id`: Delete or deactivate customer.
- `GET /api/customers/:id/history`: Get full transaction history (enquiries, quotes, SOs).

## 3. Product Master
- `GET /api/products`: Search and list equipment catalog.
- `GET /api/products/:id`: Get single product specifications.
- `POST /api/products`: Add new product model (Sales / Engg Manager).
- `PUT /api/products/:id`: Update technical specifications / pricing.
- `DELETE /api/products/:id`: Mark product as discontinued.

## 4. Enquiry Management
- `GET /api/enquiries`: Search and filter customer enquiries.
- `GET /api/enquiries/:id`: Get enquiry dossier with product lines.
- `POST /api/enquiries`: Create new customer enquiry with auto `ENQ-YYYY-0001`.
- `PUT /api/enquiries/:id`: Update enquiry data.
- `PATCH /api/enquiries/:id/status`: Update workflow status.
- `DELETE /api/enquiries/:id`: Remove enquiry.

## 5. Cost Estimation
- `GET /api/estimations`: List all BOM estimations.
- `GET /api/estimations/:id`: Get single estimation with costing breakdown.
- `POST /api/estimations`: Create new estimation with auto `EST-YYYY-0001`.
- `PUT /api/estimations/:id`: Revise estimation and record revision history.
- `PATCH /api/estimations/:id/review`: Approve or reject estimation (Engg Manager / MD).

## 6. Follow-ups
- `GET /api/followups`: List follow-ups with filter (`today`, `overdue`, `upcoming`).
- `POST /api/followups`: Log new follow-up interaction (auto `FOL-YYYY-0001`).
- `PUT /api/followups/:id`: Update follow-up status.

## 7. Lead Decisions
- `GET /api/leads`: List lead conversion decisions.
- `POST /api/leads`: Record outcome (Won / Lost / On Hold) and reason.

## 8. Quotations
- `GET /api/quotations`: Search and filter quotations.
- `GET /api/quotations/:id`: Get quotation dossier.
- `POST /api/quotations`: Create Quotation V1 with auto `QUO-YYYY-0001`.
- `POST /api/quotations/:id/revise`: Spawn new revision (V2, V3) from existing.
- `PATCH /api/quotations/:id/approve`: Authorize quotation (Sales Manager / MD).
- `PATCH /api/quotations/:id/send`: Mark sent to customer and lock version.
- `GET /api/quotations/:id/pdf`: Generate & stream professional quotation PDF.

## 9. Customer Negotiations
- `GET /api/negotiations`: List customer counter-offers.
- `POST /api/negotiations`: Record customer response (Accepted / Negotiation / Rejected).
- `PATCH /api/negotiations/:id/review`: Approve or reject negotiation terms.

## 10. Proforma Invoices
- `GET /api/proforma-invoices`: List issued Proforma Invoices.
- `GET /api/proforma-invoices/:id`: Get single PI details.
- `POST /api/proforma-invoices`: Generate PI linked to accepted quotation.
- `PATCH /api/proforma-invoices/:id/approve`: Authorize PI (Accounts / Sales Manager).
- `GET /api/proforma-invoices/:id/pdf`: Generate & stream PI PDF.

## 11. Customer Purchase Orders
- `GET /api/customer-pos`: List logged Customer POs.
- `GET /api/customer-pos/:id`: Get single Customer PO.
- `POST /api/customer-pos`: Receive customer PO.
- `PATCH /api/customer-pos/:id/verify`: Perform 3-way reconciliation check.

## 12. Payment Receipts
- `GET /api/payments`: List payment receipts.
- `POST /api/payments`: Log advance or milestone remittance.
- `PATCH /api/payments/:id/verify`: Accounts verification gate.

## 13. Sales Orders
- `GET /api/sales-orders`: List all Sales Orders.
- `GET /api/sales-orders/:id`: Get SO details and 5-department approval state.
- `POST /api/sales-orders`: Create Sales Order with auto `SO-YYYY-0001`.
- `PATCH /api/sales-orders/:id/approve-stage`: Authorize specific department stage.
- `PATCH /api/sales-orders/:id/release`: Confirm and release to plant execution.
- `GET /api/sales-orders/:id/pdf`: Generate & stream Sales Order PDF.

## 14. Dashboard, Reports & Notifications
- `GET /api/dashboard/summary`: 14 operational metric counts.
- `GET /api/dashboard/charts`: Time-series, conversion, and performance aggregates.
- `GET /api/dashboard/activities`: Recent enquiries, follow-ups, clearances.
- `GET /api/reports/:reportType`: Dynamic register data with date filters.
- `GET /api/notifications`: Get notification feed with unread count.
- `PATCH /api/notifications/read-all`: Mark all notifications as read.
