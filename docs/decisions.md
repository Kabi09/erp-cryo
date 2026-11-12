# Architecture & Technical Decisions — Cryo Scientific ERP

## ADR-001: Pure JavaScript (No TypeScript)
- **Context**: User prompt strictly mandates: "Do NOT use TypeScript. Do NOT use .ts or .tsx files. Use JavaScript (.js and .jsx) throughout the project."
- **Decision**: Frontend built exclusively in `.jsx` and `.js` using Vite with React functional components. Backend built in CommonJS Node.js (`.js`).
- **Consequences**: Fast build cycles with Vite, zero TypeScript compile overhead, strict runtime validation via Mongoose schemas.

## ADR-002: Immutable Quotation Versions
- **Context**: Quotations sent to clients or under negotiation must never be destructively overwritten.
- **Decision**: Quotations utilize compound indexing `{ quotationNumber: 1, version: 1 }`. When revised, previous records are locked (`isLocked: true`, `status: 'Revised'`) and a new incremental version (`V2`, `V3`) is created with copied or updated line items.
- **Consequences**: 100% auditable negotiation history and contract lineage.

## ADR-003: 3-Way Customer PO Verification Gate
- **Context**: Discrepancies between customer purchase orders and quotations cause manufacturing losses.
- **Decision**: Customer Purchase Order module includes an 8-point parameter verification matrix comparing Customer PO against the Accepted Quotation and Proforma Invoice. Any difference flags `verificationStatus: 'Mismatch'`, preventing automated plant release.

## ADR-004: Multi-Department 5-Stage Sales Order Approval
- **Context**: High-precision refrigeration equipment requires cross-department coordination before shop floor execution.
- **Decision**: SO model contains distinct approval subdocuments: `salesApproval`, `accountsApproval`, `technicalApproval`, `productionFeasibilityApproval`, `managementApproval`. The "Release to Production" action remains disabled until all 5 gates are satisfied.
