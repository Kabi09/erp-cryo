# Database Schema Overview — Cryo Scientific ERP

All models are managed via Mongoose ODM connected to `mongodb://localhost:27017/cryo_scientific_erp`.

## Core Entities & Collections

### 1. `User`
- `_id`: ObjectId
- `name`: String
- `email`: String (Unique, Indexed)
- `password`: String (Salted bcrypt hash)
- `role`: Enum (Super Admin, MD / Director, Sales Manager, Sales Executive, Estimation Engineer, Engineering Manager, Accounts Manager, Accounts Executive, Production Manager, Purchase Manager)
- `department`: String
- `phone`: String
- `isActive`: Boolean

### 2. `Customer`
- `_id`: ObjectId
- `customerCode`: String (Unique, `CUST-0001`)
- `companyName`: String (Indexed)
- `customerCategory`: String
- `industry`: String
- `website`: String
- `gstin`: String (Indexed)
- `pan`: String
- `paymentTerms`: String
- `contacts`: Array of `{ name, designation, email, mobile, isPrimary }`
- `billingAddresses`: Array of `{ addressLine1, city, state, pinCode, country, isDefault }`
- `shippingAddresses`: Array of `{ addressLine1, city, state, pinCode, country, isDefault }`
- `status`: Enum (Active, Inactive)

### 3. `Product`
- `_id`: ObjectId
- `productId`: String (Unique, `CRY-0001`)
- `productName`: String
- `category`: Enum (ULT Freezers, Blood Bank Refrigerators, Plasma Freezers, etc.)
- `modelNumber`: String
- `description`: String
- `technicalSpecifications`: Object (Temperature range, capacity, chamber dimensions, power supply, refrigerant, sensor type, controller)
- `sellingPrice`: Number
- `standardCost`: Number
- `gstRate`: Number (18)
- `warrantyMonths`: Number
- `status`: Enum (Active, Discontinued)

### 4. `Enquiry`
- `_id`: ObjectId
- `enquiryNumber`: String (Unique, `ENQ-YYYY-0001`)
- `enquiryDate`: Date
- `enquirySource`: Enum (Website, Phone, Email, WhatsApp, Referral, Direct Visit, Exhibition, Tender)
- `priority`: Enum (High, Medium, Low)
- `customer`: ObjectId (Ref: Customer)
- `companyName`: String
- `contactPerson`: String
- `mobileNumber`: String
- `email`: String
- `products`: Array of `{ product, productName, category, modelNumber, quantity, unit, application, technicalRequirements, temperatureRequirements, sensorRequirements, expectedBudget }`
- `assignedTo`: ObjectId (Ref: User)
- `status`: Enum (Draft, Submitted, Under Estimation, Estimation Completed, Follow-up, Won, Lost, Quotation Sent, Closed)

### 5. `Estimation`
- `_id`: ObjectId
- `estimateNumber`: String (Unique, `EST-YYYY-0001`)
- `enquiry`: ObjectId (Ref: Enquiry)
- `customer`: ObjectId (Ref: Customer)
- `items`: Array of `{ product, productName, modelNumber, quantity, costingLines: [{ category, itemName, quantity, unit, unitPrice, totalAmount }], totalEstimatedCost, profitMarginPercent, profitAmount, sellingPrice, gstAmount, finalEstimatedAmount }`
- `totalCost`: Number
- `totalSellingPrice`: Number
- `grandTotal`: Number
- `status`: Enum (Draft, Pending Approval, Approved, Rejected, Revised)
- `revisionNumber`: Number
- `revisionHistory`: Array of `{ revisionNumber, grandTotal, updatedBy, updatedAt, reason }`

### 6. `Quotation`
- `_id`: ObjectId
- `quotationNumber`: String (Indexed)
- `version`: Number (1, 2, 3)
- `versionLabel`: String (`V1`, `V2`)
- Compound Unique Index: `{ quotationNumber: 1, version: 1 }`
- `enquiry`: ObjectId (Ref: Enquiry)
- `customer`: ObjectId (Ref: Customer)
- `products`: Array of `{ product, productCode, productName, model, technicalSpecifications, quantity, unitPrice, discountPercent, taxableAmount, gstPercent, gstAmount, lineTotal }`
- `subtotal`: Number
- `discountTotal`: Number
- `taxableAmount`: Number
- `gstTotal`: Number
- `grandTotal`: Number
- `commercialTerms`: `{ paymentTerms, deliveryPeriod, warranty, installationCharges, freightTerms, bankDetails, termsAndConditions }`
- `status`: Enum (Draft, Pending Approval, Approved, Sent, Under Negotiation, Accepted, Rejected, Revised)
- `pdfUrl`: String
- `isLocked`: Boolean

### 7. `CustomerPurchaseOrder`
- `_id`: ObjectId
- `receiptId`: String (Unique, `CPO-YYYY-0001`)
- `customerPoNumber`: String
- `customerPoDate`: Date
- `quotation`: ObjectId (Ref: Quotation)
- `proformaInvoice`: ObjectId (Ref: ProformaInvoice)
- `poValue`: Number
- `verificationStatus`: Enum (Pending, Verified, Mismatch, Clarification Required, Rejected)
- `verificationChecks`: `{ productModelMatch, quantityMatch, unitPriceMatch, totalValueMatch, gstRateMatch, deliveryPeriodMatch, paymentTermsMatch, technicalSpecsMatch, mismatchNotes, verifiedBy, verifiedAt }`

### 8. `PaymentReceipt`
- `_id`: ObjectId
- `receiptNumber`: String (Unique, `REC-YYYY-0001`)
- `customer`: ObjectId (Ref: Customer)
- `proformaInvoice`: ObjectId (Ref: ProformaInvoice)
- `customerPurchaseOrder`: ObjectId (Ref: CustomerPurchaseOrder)
- `paymentDate`: Date
- `paymentMode`: Enum (NEFT, RTGS, IMPS, Cheque, Demand Draft, Other)
- `transactionId`: String
- `bankAccount`: String
- `amountReceived`: Number
- `tdsDeduction`: Number
- `netCreditAmount`: Number
- `status`: Enum (Pending Verification, Verified, Partially Received, Rejected)
- `verifiedBy`: ObjectId (Ref: User)

### 9. `SalesOrder`
- `_id`: ObjectId
- `soNumber`: String (Unique, `SO-YYYY-0001`)
- `soDate`: Date
- `enquiry`: ObjectId (Ref: Enquiry)
- `customer`: ObjectId (Ref: Customer)
- `quotation`: ObjectId (Ref: Quotation)
- `customerPurchaseOrder`: ObjectId (Ref: CustomerPurchaseOrder)
- `products`: Array of `{ product, productName, model, technicalSpecification, quantity, unitPrice, discount, totalAmount, deliverySchedule, warranty }`
- `soValue`: Number
- `advanceRequired`: Number
- `advanceReceived`: Number
- `balanceAmount`: Number
- `approvals`: `{ salesApproval, accountsApproval, technicalApproval, productionFeasibilityApproval, managementApproval }`
- `soStatus`: Enum (Draft, Pending Approvals, Confirmed, Released to Production, In Manufacturing, Dispatched, Cancelled)
- `releaseForExecution`: `{ isReleased, releasedBy, releasedAt, productionNotificationSent, purchaseNotificationSent, releaseNotes }`
- `pdfUrl`: String

### 10. `Counter`
- `key`: String (Unique, e.g. `ENQ-2026`, `SO-2026`)
- `sequenceValue`: Number (Atomic increment `$inc`)
