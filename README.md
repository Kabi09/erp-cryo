# Cryo Scientific Systems Pvt. Ltd. — Enquiry to Sales Order (SO) Management System

An enterprise-grade, full-stack MERN ERP web application engineered for **Cryo Scientific Systems Pvt. Ltd.** to automate, track, and govern the complete commercial lifecycle: from initial customer enquiry, BOM cost estimation, follow-up interactions, lead decisions, multi-version quotations, customer counter-negotiations, proforma invoices, 3-way PO verification, and payment receipts, to multi-departmental clearance and final plant release of Sales Orders.

---

## 1. System Architecture & Tech Stack

### Strict Stack Adherence
- **Frontend**: Pure JavaScript React.js (NO TypeScript, `.js` and `.jsx` throughout), Vite bundler, Tailwind CSS, Lucide React icons, Recharts, React Router DOM v6, Axios.
- **Backend**: Node.js & Express.js REST APIs in strict MVC architecture, Multer for file uploads, PDFKit for automated corporate PDF document generation (Quotations, PIs, Sales Orders).
- **Database**: MongoDB with Mongoose ODM (ObjectIds, indexes, sequence generators, atomic counters).
- **Security & RBAC**: JWT (JSON Web Tokens), bcryptjs password hashing (10 salt rounds), 10 role-based access gates, audit trail logger.

---

## 2. Default Seeded Accounts for Testing

All staff accounts are pre-seeded with the password: **`Password@123`**

| Role | Email | Name | Primary Functions |
|---|---|---|---|
| **Super Admin** | `admin@cryoscientific.com` | Dr. K. Ramanathan | System-wide admin, all modules & overrides |
| **MD / Director** | `director@cryoscientific.com` | V. Sundaram | Management final SO release, negotiations |
| **Sales Manager** | `sales.manager@cryoscientific.com` | Karthik Narayanan | Quote approvals, negotiation counter-offers, SO clearances |
| **Sales Executive** | `sales.rajesh@cryoscientific.com` | Rajesh Kumar | Enquiries, quotations, customer follow-ups |
| **Estimation Engineer** | `estimate.arun@cryoscientific.com` | Arun Balaji | Internal BOM costing, sensors & compressor costing |
| **Engineering Manager** | `engg.manager@cryoscientific.com` | Dr. M. Sridhar | Estimation review/approval, 3-way PO verification |
| **Accounts Manager** | `accounts.manager@cryoscientific.com` | Venkatachalam R | Financial receipt verification, PI approval, SO accounts signoff |
| **Accounts Executive** | `accounts.priya@cryoscientific.com` | Priya Dharshini | Log payment receipts, RTGS/NEFT transaction records |
| **Production Manager** | `prod.manager@cryoscientific.com` | G. Natarajan | Feasibility clearance, manufacturing execution receipt |
| **Purchase Manager** | `purchase.manager@cryoscientific.com` | Anand Mohan | Raw material procurement, cascade compressor inventory |

*(Note: The login page includes 1-click test role switcher buttons to test role-based behavior instantly).*

---

## 3. End-to-End Workflow Modules

1. **Executive Dashboard**: 14 operational metric counters, 4 Recharts visual charts (monthly trends, won vs lost donut, top client accounts, high-demand equipment models), recent activity feeds, and approval alerts.
2. **Customer Master**: Comprehensive client profiles, contact person matrices, multiple billing/shipping addresses, GST/PAN validation, and full historical transaction logs.
3. **Product Master & Specs**: Cryogenic equipment lines (-86°C ULT freezers, 4°C blood bank refrigerators, -40°C plasma freezers, lyophilizers, LN2 dewars) with technical temperature and PLC specs.
4. **Enquiry Management**: Auto-numbered `ENQ-YYYY-0001`, dynamic multi-item lines, operating temperature specifications, and direct action triggers.
5. **Cost Estimation (BOM)**: Auto-numbered `EST-YYYY-0001`, itemized dynamic costing (raw materials, sensors, controllers, labour, testing, packing, transport), margin calculation, and Engineering Manager approvals.
6. **Follow-up Interactions**: Multi-channel interaction logs (Call, WhatsApp, Email, Meeting), customer sentiment tagging, and reminder alerts.
7. **Lead Won / Lost**: Analytical tracking with structured win/loss rationales.
8. **Multi-Version Quotations**: Auto-numbered `QUO-YYYY-0001`, immutable versioning (`V1`, `V2`, `V3`), commercial terms, and professional PDF generation.
9. **Customer Negotiation**: Counter-offer handling, discount requests, and sales manager review loops.
10. **Proforma Invoice (PI)**: Auto-numbered `PI-YYYY-0001`, advance/balance payment splits, bank remittance details, and PDF generation.
11. **Customer Purchase Order**: Automated 3-way reconciliation (Customer PO vs Quotation vs PI), 8-point parameter verification, and mismatch warnings.
12. **Payment Receipt Management**: Auto-numbered `REC-YYYY-0001`, partial credits, TDS tracking, and Accounts department verification gate.
13. **Sales Order (SO)**: Auto-numbered `SO-YYYY-0001`, 5 departmental clearance gates (Sales, Accounts, Technical, Feasibility, Management), official plant release trigger, and SO PDF generation.
14. **Reports & Registers**: 8 registers with date filters, KPI summaries, CSV export, and print formatting.
15. **User Governance**: Staff user creation, RBAC enforcement, and active/deactivate toggles.

---

## 4. Installation & Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `localhost:27017`

### Step 1: Clone & Configure Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed     # Seeds realistic Cryo Scientific staff, products, clients, and orders
npm start        # Starts server on http://localhost:5000
```

### Step 2: Configure & Launch Frontend
```bash
cd ../frontend
npm install
npm run dev      # Launches Vite dev server on http://localhost:5173
```

### Production Build
```bash
npm run build:frontend   # Generates optimized production distribution in frontend/dist/
```
