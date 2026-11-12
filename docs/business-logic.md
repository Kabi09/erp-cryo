# Domain Business Logic & Validation Rules

1. **Sequential Numbering Format**:
   - Enquiry: `ENQ-YYYY-0001`
   - Estimation: `EST-YYYY-0001`
   - Quotation: `QUO-YYYY-0001` with versions (`V1`, `V2`, etc.)
   - Proforma Invoice: `PI-YYYY-0001`
   - Payment Receipt: `REC-YYYY-0001`
   - Sales Order: `SO-YYYY-0001`

2. **Customer Duplicate Prevention**:
   - System checks for existing GSTIN or Company Email before saving new customer records.

3. **Multi-Product Line Items**:
   - Enquiries, Quotations, and Sales Orders support dynamic multi-item arrays with individual quantities, unit pricing, discounts, tax rates, and line totals.

4. **Internal Costing Calculation**:
   - Total Cost = Raw Materials + Sensors + Heating Elements + Controllers + Electrical + Labour + Manufacturing + Testing + Packing + Transportation + Other.
   - Selling Price = Total Cost * (1 + Profit Margin % / 100).
   - Final Estimated Amount = Selling Price * (1 + GST % / 100).

5. **Quotation Immutable Versioning**:
   - Once a quotation version is marked "Sent" or "Accepted", its fields become read-only. Any negotiation modifications spawn a new incremental version (`V2`, `V3`).

6. **3-Way PO Reconciliation**:
   - System compares Customer PO with Accepted Quotation & PI across Unit Price, Quantity, Model, Delivery Date, and Payment Terms.
   - Any variance sets status to `Mismatch` or `Clarification Required`.
   - SO cannot be confirmed without explicit manager override or resolved discrepancy.

7. **Financial Verification Gate**:
   - Only users with `Accounts Manager` or `Accounts Executive` or `Super Admin` role can verify payment receipts and clear advance payment requirements.

8. **Sales Order 5-Stage Approval**:
   - SO must pass Sales, Accounts, Technical, Production Feasibility, and Management approvals before being confirmed and released to the factory floor.
