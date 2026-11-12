# Cryo Scientific Systems – AI Instructions

## 1. Project Overview
This repository contains the Sales Workflow Management System for **Cryo Scientific Systems Pvt Ltd**.
It automates and tracks the complete Lead-to-Sales-Order (SO) workflow with handover to Production.

## 2. Core Mandatory Technology Rules
- **Frontend**: React.js (Vite), JavaScript (ES6+), JSX, Tailwind CSS, Lucide React, Zustand, Axios, React Router DOM, Day.js, React Hook Form, Zod.
- **Backend**: Node.js, Express.js, JavaScript (CommonJS), MongoDB, Mongoose, JWT Authentication, bcryptjs, Multer for file uploads, PDFKit for PDF generation, express-rate-limit, helmet, cors.
- **Strict JavaScript Only**: Do NOT use TypeScript. Do NOT create `.ts` or `.tsx` files. Use `.js` and `.jsx` only.
- **Light Mode Only**: Inspired by Zoho CRM and HubSpot with professional blue (`#0284c7`, `#0369a1`, `#0f172a`) and slate color palette.
- **No Git Push**: Never push code to remote repositories.

## 3. Mandatory Sales Workflow Stages
1. Lead / Enquiry
2. Lead Qualification (Qualified / Disqualified)
3. Customer Master Creation / Update
4. Quotation Creation (Rev 0)
5. Customer Review & Feedback
6. Negotiation & Quotation Revisions (Rev 1, Rev 2, ... - never overwrite previous versions)
7. Quotation Won (Mandatory prerequisite for PI)
8. Proforma Invoice (PI) Generation & PDF
9. Customer Purchase Order (PO) Upload & Details
10. Five-Point PO Verification (Product/Spec, Quantity, Unit Price & Total, Delivery Date, Payment Terms) - All 5 MUST match before SO creation.
11. Sales Order (SO) Creation (Blocked if any mismatch exists)
12. Handover to Production (Status update, handover notes, Sales Admin sign-off)

## 4. Activity Timeline
Every Lead maintains a detailed audit timeline of every action taken across the entire workflow.

