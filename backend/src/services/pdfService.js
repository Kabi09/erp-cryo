const PDFDocument = require('pdfkit');

// Helper to format currency (INR)
const formatINR = (num) => {
  if (num === null || num === undefined) return 'Rs. 0.00';
  return 'Rs. ' + Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Generate Quotation PDF
const generateQuotationPDF = (quotation, revision, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  doc.pipe(res);

  // Header banner
  doc.rect(0, 0, doc.page.width, 18).fill('#0284c7');

  // Company Brand Header
  doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold').text('CRYO SCIENTIFIC SYSTEMS PVT LTD', 40, 35);
  doc.fontSize(8.5).font('Helvetica').fillColor('#475569');
  doc.text('Specialists in Ultra-Low Temperature & Cryogenic Engineering Solutions', 40, 56);
  doc.text('Plot No. 24 & 25, Guindy Industrial Estate, Chennai - 600 032, Tamil Nadu, India', 40, 68);
  doc.text('Tel: +91 44 2250 1234 | Email: sales@cryoscientific.com | Web: www.cryoscientific.com', 40, 80);
  doc.text('GSTIN: 33AAACC1234F1Z5 | CIN: U29199TN1995PTC031245', 40, 92);

  // Divider line
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, 106).lineTo(doc.page.width - 40, 106).stroke();

  // Document Title Box
  doc.rect(40, 114, doc.page.width - 80, 24).fill('#f1f5f9');
  doc.fillColor('#0369a1').fontSize(12).font('Helvetica-Bold').text('COMMERCIAL & TECHNICAL QUOTATION', 45, 120, { align: 'center', width: doc.page.width - 90 });

  // Metadata Block (Two columns: Customer & Quote Details)
  const metaY = 146;
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text('CUSTOMER DETAILS:', 40, metaY);
  doc.font('Helvetica').fillColor('#334155');
  doc.text(`Company: ${quotation.customer?.companyName || 'N/A'}`, 40, metaY + 14);
  doc.text(`Contact: ${quotation.customer?.contactPerson?.name || 'Authorized Purchaser'} (${quotation.customer?.contactPerson?.designation || 'Purchase Dept'})`, 40, metaY + 26);
  doc.text(`Email: ${quotation.customer?.email || 'N/A'} | Phone: ${quotation.customer?.phone || 'N/A'}`, 40, metaY + 38);
  doc.text(`GSTIN: ${quotation.customer?.gstin || 'Unregistered / Exempt'}`, 40, metaY + 50);
  const billAddr = quotation.customer?.billingAddress;
  const addressText = billAddr ? `${billAddr.addressLine1 || ''}, ${billAddr.city || ''}, ${billAddr.state || ''} - ${billAddr.postalCode || ''}` : 'As on file';
  doc.text(`Address: ${addressText}`, 40, metaY + 62, { width: 250 });

  // Quote Metadata (Right column)
  const rightX = 330;
  doc.font('Helvetica-Bold').fillColor('#0f172a').text('QUOTATION DETAILS:', rightX, metaY);
  doc.font('Helvetica').fillColor('#334155');
  doc.text(`Quote Ref: ${quotation.quotationNumber}`, rightX, metaY + 14);
  doc.text(`Revision: ${revision.revisionLabel} (${revision.revisionReason || 'Standard'})`, rightX, metaY + 26);
  doc.text(`Date: ${new Date(revision.createdAt || Date.now()).toLocaleDateString('en-IN')}`, rightX, metaY + 38);
  doc.text(`Validity: ${revision.validityDays || 30} Days from issue date`, rightX, metaY + 50);
  doc.text(`Lead Reference: ${quotation.lead?.leadNumber || 'N/A'}`, rightX, metaY + 62);

  // Line Items Table Header
  const tableY = 230;
  doc.rect(40, tableY, doc.page.width - 80, 20).fill('#0284c7');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
  doc.text('S.No', 45, tableY + 5, { width: 25 });
  doc.text('Item Description & Specifications', 75, tableY + 5, { width: 195 });
  doc.text('HSN', 275, tableY + 5, { width: 45 });
  doc.text('Qty', 325, tableY + 5, { width: 30, align: 'center' });
  doc.text('Unit Rate', 360, tableY + 5, { width: 60, align: 'right' });
  doc.text('GST %', 425, tableY + 5, { width: 35, align: 'center' });
  doc.text('Total (INR)', 465, tableY + 5, { width: 85, align: 'right' });

  let curY = tableY + 22;
  const items = revision.items || [];

  items.forEach((item, index) => {
    const isAlt = index % 2 === 1;
    if (isAlt) {
      doc.rect(40, curY, doc.page.width - 80, 34).fill('#f8fafc');
    }

    doc.fillColor('#0f172a').font('Helvetica').fontSize(8);
    doc.text(String(index + 1), 45, curY + 4, { width: 25 });
    
    // Product title & spec
    doc.font('Helvetica-Bold').text(item.productName, 75, curY + 4, { width: 195 });
    doc.font('Helvetica').fontSize(7).fillColor('#64748b').text(item.specification || '', 75, curY + 15, { width: 195, height: 16 });

    doc.fontSize(8).fillColor('#0f172a');
    doc.text(item.hsnCode || '841869', 275, curY + 4, { width: 45 });
    doc.text(`${item.quantity} ${item.unit || 'Nos'}`, 325, curY + 4, { width: 30, align: 'center' });
    doc.text(formatINR(item.unitPrice), 360, curY + 4, { width: 60, align: 'right' });
    doc.text(`${item.gstRate || 18}%`, 425, curY + 4, { width: 35, align: 'center' });
    doc.font('Helvetica-Bold').text(formatINR(item.totalAmount), 465, curY + 4, { width: 85, align: 'right' });

    curY += 36;
  });

  // Table bottom border
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(40, curY).lineTo(doc.page.width - 40, curY).stroke();

  // Summary Totals Box
  curY += 8;
  const summaryX = 330;
  const summaryWidth = doc.page.width - 40 - summaryX;

  doc.fontSize(8.5).font('Helvetica').fillColor('#334155');
  doc.text('Sub Total:', summaryX, curY);
  doc.text(formatINR(revision.subTotal), summaryX + 80, curY, { align: 'right', width: summaryWidth - 80 });

  if (revision.totalDiscount > 0) {
    curY += 14;
    doc.text('Discount:', summaryX, curY);
    doc.text(`- ${formatINR(revision.totalDiscount)}`, summaryX + 80, curY, { align: 'right', width: summaryWidth - 80 });
  }

  curY += 14;
  doc.text('Taxable Value:', summaryX, curY);
  doc.text(formatINR(revision.taxableAmount), summaryX + 80, curY, { align: 'right', width: summaryWidth - 80 });

  curY += 14;
  doc.text('GST Total:', summaryX, curY);
  doc.text(formatINR(revision.totalGst), summaryX + 80, curY, { align: 'right', width: summaryWidth - 80 });

  curY += 16;
  doc.rect(summaryX - 5, curY - 3, summaryWidth + 5, 20).fill('#0369a1');
  doc.font('Helvetica-Bold').fillColor('#ffffff').text('Grand Total:', summaryX, curY + 2);
  doc.text(formatINR(revision.grandTotal), summaryX + 80, curY + 2, { align: 'right', width: summaryWidth - 80 });

  // Terms and Conditions Section
  curY += 30;
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text('TERMS AND CONDITIONS:', 40, curY);
  curY += 14;
  doc.font('Helvetica').fontSize(8).fillColor('#334155');
  doc.text(`1. Payment Terms: ${revision.paymentTerms || '30% Advance, balance against PI before dispatch.'}`, 40, curY, { width: 515 });
  curY += 14;
  doc.text(`2. Delivery Period: ${revision.deliveryPeriod || '4 to 6 Weeks from PO acceptance.'}`, 40, curY, { width: 515 });
  curY += 14;
  doc.text(`3. Warranty: ${revision.warranty || '12 Months from commissioning against manufacturing defects.'}`, 40, curY, { width: 515 });
  curY += 14;
  doc.text(`4. Freight & Transit: ${revision.freightTerms || 'Ex-works Chennai. Freight & Transit Insurance extra.'}`, 40, curY, { width: 515 });
  curY += 14;
  doc.text(`5. Special Conditions: ${revision.specialTerms || 'Standard factory inspection included.'}`, 40, curY, { width: 515 });

  // Signature Block
  const sigY = 720;
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(370, sigY).lineTo(540, sigY).stroke();
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text('For Cryo Scientific Systems Pvt Ltd', 370, sigY + 6);
  doc.font('Helvetica').fontSize(7.5).fillColor('#64748b').text('Authorized Commercial Signatory', 370, sigY + 18);

  doc.end();
};

// Generate Proforma Invoice PDF
const generatePIPDF = (pi, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  doc.pipe(res);

  // Top header banner
  doc.rect(0, 0, doc.page.width, 18).fill('#047857');

  // Company Brand Header
  doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold').text('CRYO SCIENTIFIC SYSTEMS PVT LTD', 40, 35);
  doc.fontSize(8.5).font('Helvetica').fillColor('#475569');
  doc.text('Plot No. 24 & 25, Guindy Industrial Estate, Chennai - 600 032, Tamil Nadu, India', 40, 56);
  doc.text('Tel: +91 44 2250 1234 | Email: accounts@cryoscientific.com | Web: www.cryoscientific.com', 40, 68);
  doc.text('GSTIN: 33AAACC1234F1Z5 | PAN: AAACC1234F | State Code: 33 (Tamil Nadu)', 40, 80);

  // Divider line
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, 96).lineTo(doc.page.width - 40, 96).stroke();

  // Document Title Box
  doc.rect(40, 104, doc.page.width - 80, 24).fill('#ecfdf5');
  doc.fillColor('#065f46').fontSize(12).font('Helvetica-Bold').text('PROFORMA INVOICE', 45, 110, { align: 'center', width: doc.page.width - 90 });

  // Metadata Block
  const metaY = 138;
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text('BUYER / BILLED TO:', 40, metaY);
  doc.font('Helvetica').fillColor('#334155');
  doc.text(`Company: ${pi.customer?.companyName || 'N/A'}`, 40, metaY + 14);
  doc.text(`Contact: ${pi.customer?.contactPerson?.name || 'Accounts/Purchase Dept'}`, 40, metaY + 26);
  doc.text(`Email: ${pi.customer?.email || 'N/A'} | Phone: ${pi.customer?.phone || 'N/A'}`, 40, metaY + 38);
  doc.text(`GSTIN: ${pi.customer?.gstin || 'Unregistered'}`, 40, metaY + 50);

  // PI Details (Right Column)
  const rightX = 330;
  doc.font('Helvetica-Bold').fillColor('#0f172a').text('INVOICE METADATA:', rightX, metaY);
  doc.font('Helvetica').fillColor('#334155');
  doc.text(`PI Number: ${pi.piNumber}`, rightX, metaY + 14);
  doc.text(`PI Date: ${new Date(pi.piDate || Date.now()).toLocaleDateString('en-IN')}`, rightX, metaY + 26);
  doc.text(`Quotation Ref: ${pi.quotation?.quotationNumber || 'N/A'}`, rightX, metaY + 38);
  doc.text(`Enquiry Ref: ${pi.lead?.leadNumber || 'N/A'}`, rightX, metaY + 50);

  // Table
  const tableY = 210;
  doc.rect(40, tableY, doc.page.width - 80, 20).fill('#047857');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
  doc.text('S.No', 45, tableY + 5, { width: 25 });
  doc.text('Description of Cryogenic Equipment', 75, tableY + 5, { width: 195 });
  doc.text('HSN Code', 275, tableY + 5, { width: 45 });
  doc.text('Qty', 325, tableY + 5, { width: 30, align: 'center' });
  doc.text('Unit Price', 360, tableY + 5, { width: 60, align: 'right' });
  doc.text('GST %', 425, tableY + 5, { width: 35, align: 'center' });
  doc.text('Amount (INR)', 465, tableY + 5, { width: 85, align: 'right' });

  let curY = tableY + 22;
  const items = pi.items || [];

  items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.rect(40, curY, doc.page.width - 80, 32).fill('#f8fafc');
    }

    doc.fillColor('#0f172a').font('Helvetica').fontSize(8);
    doc.text(String(index + 1), 45, curY + 4, { width: 25 });
    doc.font('Helvetica-Bold').text(item.productName, 75, curY + 4, { width: 195 });
    doc.font('Helvetica').fontSize(7).fillColor('#64748b').text(item.specification || '', 75, curY + 15, { width: 195, height: 14 });

    doc.fontSize(8).fillColor('#0f172a');
    doc.text(item.hsnCode || '841869', 275, curY + 4, { width: 45 });
    doc.text(`${item.quantity} ${item.unit || 'Nos'}`, 325, curY + 4, { width: 30, align: 'center' });
    doc.text(formatINR(item.unitPrice), 360, curY + 4, { width: 60, align: 'right' });
    doc.text(`${item.gstRate || 18}%`, 425, curY + 4, { width: 35, align: 'center' });
    doc.font('Helvetica-Bold').text(formatINR(item.totalAmount), 465, curY + 4, { width: 85, align: 'right' });

    curY += 34;
  });

  // Table bottom border
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(40, curY).lineTo(doc.page.width - 40, curY).stroke();

  // Banking Details on Left & Totals on Right
  curY += 12;
  const bankX = 40;
  doc.rect(bankX, curY, 260, 95).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#047857').text('BANK DETAILS FOR REMITTANCE:', bankX + 8, curY + 8);
  doc.font('Helvetica').fontSize(8).fillColor('#334155');
  doc.text(`Account Name: ${pi.bankDetails?.accountName || 'Cryo Scientific Systems Pvt Ltd'}`, bankX + 8, curY + 22);
  doc.text(`Bank Name: ${pi.bankDetails?.bankName || 'State Bank of India'}`, bankX + 8, curY + 34);
  doc.text(`Account No: ${pi.bankDetails?.accountNumber || '382910482019'}`, bankX + 8, curY + 46);
  doc.text(`IFSC Code: ${pi.bankDetails?.ifscCode || 'SBIN0004128'}`, bankX + 8, curY + 58);
  doc.text(`Branch: ${pi.bankDetails?.branch || 'Guindy Industrial Estate, Chennai'}`, bankX + 8, curY + 70);

  // Totals column
  const sumX = 330;
  const sumW = doc.page.width - 40 - sumX;
  doc.font('Helvetica').fontSize(8.5).fillColor('#334155');
  doc.text('Sub Total:', sumX, curY + 8);
  doc.text(formatINR(pi.subTotal), sumX + 80, curY + 8, { align: 'right', width: sumW - 80 });

  doc.text('Taxable Value:', sumX, curY + 24);
  doc.text(formatINR(pi.taxableAmount), sumX + 80, curY + 24, { align: 'right', width: sumW - 80 });

  doc.text('GST (18%):', sumX, curY + 40);
  doc.text(formatINR(pi.totalGst), sumX + 80, curY + 40, { align: 'right', width: sumW - 80 });

  doc.rect(sumX - 5, curY + 58, sumW + 5, 22).fill('#047857');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
  doc.text('Total Payable:', sumX, curY + 64);
  doc.text(formatINR(pi.grandTotal), sumX + 80, curY + 64, { align: 'right', width: sumW - 80 });

  // Terms
  const termsY = curY + 110;
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a').text('TERMS OF SALE & REMITTANCE:', 40, termsY);
  doc.font('Helvetica').fontSize(8).fillColor('#475569');
  doc.text(`- Payment Terms: ${pi.paymentTerms}`, 40, termsY + 14);
  doc.text(`- Delivery Timeline: ${pi.deliveryPeriod}`, 40, termsY + 26);
  doc.text('- Goods once sold cannot be returned without prior written factory clearance.', 40, termsY + 38);

  // Signatory
  const sigY = 720;
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(370, sigY).lineTo(540, sigY).stroke();
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text('For Cryo Scientific Systems Pvt Ltd', 370, sigY + 6);
  doc.font('Helvetica').fontSize(7.5).fillColor('#64748b').text('Finance & Accounts Signatory', 370, sigY + 18);

  doc.end();
};

module.exports = {
  generateQuotationPDF,
  generatePIPDF
};

