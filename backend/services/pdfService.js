const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure uploads/pdfs folder exists
const pdfDir = path.join(__dirname, '..', 'uploads', 'pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// Generate Quotation PDF
const generateQuotationPDF = (quotation) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `${quotation.quotationNumber}-${quotation.versionLabel || 'V1'}.pdf`;
      const filePath = path.join(pdfDir, fileName);
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header Banner
      doc.rect(40, 40, 515, 65).fill('#0f2d59');
      doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('CRYO SCIENTIFIC SYSTEMS PVT. LTD.', 55, 52);
      doc.fontSize(9).font('Helvetica').text('Specialists in Ultra-Low Temperature & Medical Refrigeration Systems', 55, 75);
      doc.text('Ambattur Industrial Estate, Chennai - 600058, Tamil Nadu, India | sales@cryoscientific.com', 55, 87);

      // Document Title
      doc.moveDown(2);
      doc.fillColor('#0f2d59').fontSize(16).font('Helvetica-Bold').text('COMMERCIAL QUOTATION', 40, 120, { align: 'center' });

      // Info Grid
      doc.rect(40, 145, 515, 75).strokeColor('#d1d5db').stroke();
      doc.fillColor('#1f2937').fontSize(9).font('Helvetica-Bold');
      doc.text(`Quotation No: ${quotation.quotationNumber} (${quotation.versionLabel})`, 50, 155);
      doc.font('Helvetica').text(`Date: ${new Date(quotation.quotationDate).toLocaleDateString('en-GB')}`, 50, 170);
      doc.text(`Valid Until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-GB') : '30 Days from date'}`, 50, 185);
      doc.text(`Enquiry Ref: ${quotation.enquiryNumber || 'N/A'}`, 50, 200);

      doc.font('Helvetica-Bold').text('Customer Details:', 310, 155);
      doc.font('Helvetica').text(`${quotation.customerName}`, 310, 170);
      doc.text(`${quotation.billingAddress || 'Tamil Nadu, India'}`, 310, 185, { width: 230 });

      // Products Table Header
      let y = 235;
      doc.rect(40, y, 515, 20).fill('#e5e7eb');
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8);
      doc.text('#', 45, y + 6);
      doc.text('Item & Technical Description', 65, y + 6);
      doc.text('Qty', 320, y + 6);
      doc.text('Unit Price (INR)', 355, y + 6);
      doc.text('GST', 435, y + 6);
      doc.text('Total (INR)', 480, y + 6);

      y += 24;
      doc.font('Helvetica').fontSize(8).fillColor('#374151');

      quotation.products.forEach((prod, index) => {
        const itemHeight = 36;
        if (y + itemHeight > 700) {
          doc.addPage();
          y = 50;
        }

        doc.rect(40, y - 2, 515, itemHeight).strokeColor('#f3f4f6').stroke();
        doc.text(`${index + 1}`, 45, y + 4);
        doc.font('Helvetica-Bold').text(`${prod.productName} (Model: ${prod.model || 'Standard'})`, 65, y + 4, { width: 245 });
        doc.font('Helvetica').text(`${prod.technicalSpecifications || prod.description || 'Standard Cryo Scientific Specification'}`, 65, y + 15, { width: 245 });
        doc.text(`${prod.quantity} ${prod.unit || 'Nos'}`, 320, y + 4);
        doc.text(`₹${(prod.unitPrice || 0).toLocaleString('en-IN')}`, 355, y + 4);
        doc.text(`${prod.gstPercent || 18}%`, 435, y + 4);
        doc.font('Helvetica-Bold').text(`₹${(prod.lineTotal || 0).toLocaleString('en-IN')}`, 475, y + 4);

        y += itemHeight + 4;
      });

      // Totals Box
      y += 10;
      doc.rect(330, y, 225, 65).strokeColor('#d1d5db').stroke();
      doc.font('Helvetica').fontSize(9).fillColor('#4b5563');
      doc.text('Subtotal:', 340, y + 8);
      doc.text(`₹${(quotation.subtotal || 0).toLocaleString('en-IN')}`, 460, y + 8, { align: 'right', width: 85 });

      doc.text('Total GST (18%):', 340, y + 24);
      doc.text(`₹${(quotation.gstTotal || 0).toLocaleString('en-IN')}`, 460, y + 24, { align: 'right', width: 85 });

      doc.font('Helvetica-Bold').fillColor('#0f2d59').fontSize(10);
      doc.text('Grand Total:', 340, y + 44);
      doc.text(`₹${(quotation.grandTotal || 0).toLocaleString('en-IN')}`, 450, y + 44, { align: 'right', width: 95 });

      // Commercial Terms
      y += 85;
      if (y > 660) {
        doc.addPage();
        y = 50;
      }

      doc.fillColor('#0f2d59').font('Helvetica-Bold').fontSize(10).text('COMMERCIAL TERMS & CONDITIONS:', 40, y);
      y += 15;
      doc.font('Helvetica').fontSize(8).fillColor('#374151');
      doc.text(`1. Payment Terms: ${quotation.commercialTerms?.paymentTerms || '30% Advance, 70% before dispatch'}`, 45, y);
      y += 13;
      doc.text(`2. Delivery Period: ${quotation.commercialTerms?.deliveryPeriod || '4 to 6 weeks from PO'}`, 45, y);
      y += 13;
      doc.text(`3. Warranty: ${quotation.commercialTerms?.warranty || '12 Months comprehensive warranty'}`, 45, y);
      y += 13;
      doc.text(`4. Installation & Commissioning: ${quotation.commercialTerms?.installationCharges || 'Free at customer site'}`, 45, y);
      y += 13;
      doc.text(`5. Freight Terms: ${quotation.commercialTerms?.freightTerms || 'Ex-Works Chennai'}`, 45, y);

      // Sign-off
      y += 35;
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827');
      doc.text('For CRYO SCIENTIFIC SYSTEMS PVT. LTD.', 340, y);
      doc.font('Helvetica').fontSize(8).text('Authorized Signatory / Sales Division', 340, y + 45);

      doc.end();

      stream.on('finish', () => resolve(`/uploads/pdfs/${fileName}`));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

// Generate Proforma Invoice PDF
const generateProformaInvoicePDF = (pi) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `${pi.piNumber}.pdf`;
      const filePath = path.join(pdfDir, fileName);
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header Banner
      doc.rect(40, 40, 515, 65).fill('#0f2d59');
      doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('CRYO SCIENTIFIC SYSTEMS PVT. LTD.', 55, 52);
      doc.fontSize(9).font('Helvetica').text('Specialists in Ultra-Low Temperature & Medical Refrigeration Systems', 55, 75);
      doc.text('Ambattur Industrial Estate, Chennai - 600058 | GSTIN: 33AAACC4912B1Z4', 55, 87);

      doc.moveDown(2);
      doc.fillColor('#0f2d59').fontSize(16).font('Helvetica-Bold').text('PROFORMA INVOICE', 40, 120, { align: 'center' });

      // Info Grid
      doc.rect(40, 145, 515, 80).strokeColor('#d1d5db').stroke();
      doc.fillColor('#1f2937').fontSize(9).font('Helvetica-Bold');
      doc.text(`PI Number: ${pi.piNumber}`, 50, 155);
      doc.font('Helvetica').text(`Date: ${new Date(pi.piDate).toLocaleDateString('en-GB')}`, 50, 170);
      doc.text(`Quotation Ref: ${pi.quotationNumber} (${pi.quotationVersion || 'V1'})`, 50, 185);
      doc.text(`Enquiry Ref: ${pi.enquiryNumber || 'N/A'}`, 50, 200);

      doc.font('Helvetica-Bold').text('Buyer / Bill To:', 310, 155);
      doc.font('Helvetica').text(`${pi.customerName}`, 310, 170);
      doc.text(`${pi.billingAddress || 'Tamil Nadu, India'}`, 310, 185, { width: 230 });

      // Products Table Header
      let y = 240;
      doc.rect(40, y, 515, 20).fill('#e5e7eb');
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8);
      doc.text('#', 45, y + 6);
      doc.text('Description of Equipment', 65, y + 6);
      doc.text('Qty', 320, y + 6);
      doc.text('Unit Rate (INR)', 355, y + 6);
      doc.text('GST', 435, y + 6);
      doc.text('Total (INR)', 480, y + 6);

      y += 24;
      doc.font('Helvetica').fontSize(8).fillColor('#374151');

      pi.products.forEach((prod, index) => {
        const itemHeight = 30;
        doc.rect(40, y - 2, 515, itemHeight).strokeColor('#f3f4f6').stroke();
        doc.text(`${index + 1}`, 45, y + 4);
        doc.font('Helvetica-Bold').text(`${prod.productName} (${prod.model || 'Standard'})`, 65, y + 4, { width: 245 });
        doc.font('Helvetica').text(`${prod.description || 'Scientific Cryogenic Refrigeration Unit'}`, 65, y + 14, { width: 245 });
        doc.text(`${prod.quantity} ${prod.unit || 'Nos'}`, 320, y + 4);
        doc.text(`₹${(prod.unitPrice || 0).toLocaleString('en-IN')}`, 355, y + 4);
        doc.text(`${prod.gstPercent || 18}%`, 435, y + 4);
        doc.font('Helvetica-Bold').text(`₹${(prod.lineTotal || 0).toLocaleString('en-IN')}`, 475, y + 4);
        y += itemHeight + 4;
      });

      // Payment Split Box
      y += 10;
      doc.rect(40, y, 260, 80).strokeColor('#d1d5db').stroke();
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f2d59').text('PAYMENT SCHEDULE:', 50, y + 8);
      doc.font('Helvetica').fontSize(8).fillColor('#374151');
      doc.text(`Advance Required (${pi.advancePercentage}%): ₹${(pi.advanceAmount || 0).toLocaleString('en-IN')}`, 50, y + 25);
      doc.text(`Balance Payable (${pi.balancePercentage}%): ₹${(pi.balanceAmount || 0).toLocaleString('en-IN')}`, 50, y + 42);
      doc.text(`Terms: ${pi.paymentTerms || 'Advance with PO, balance against PI before dispatch'}`, 50, y + 59, { width: 240 });

      // Totals Box
      doc.rect(310, y, 245, 80).strokeColor('#d1d5db').stroke();
      doc.font('Helvetica').fontSize(9).fillColor('#4b5563');
      doc.text('Taxable Amount:', 320, y + 10);
      doc.text(`₹${(pi.totalTaxableAmount || 0).toLocaleString('en-IN')}`, 440, y + 10, { align: 'right', width: 105 });

      doc.text('Total GST (18%):', 320, y + 28);
      doc.text(`₹${(pi.totalGstAmount || 0).toLocaleString('en-IN')}`, 440, y + 28, { align: 'right', width: 105 });

      doc.font('Helvetica-Bold').fillColor('#0f2d59').fontSize(10);
      doc.text('Total PI Value:', 320, y + 52);
      doc.text(`₹${(pi.totalPiAmount || 0).toLocaleString('en-IN')}`, 430, y + 52, { align: 'right', width: 115 });

      // Bank Details
      y += 95;
      doc.rect(40, y, 515, 60).fill('#f9fafb').strokeColor('#e5e7eb').stroke();
      doc.fillColor('#0f2d59').font('Helvetica-Bold').fontSize(9).text('BANK DETAILS FOR DIRECT REMITTANCE / RTGS / NEFT:', 50, y + 8);
      doc.fillColor('#374151').font('Helvetica').fontSize(8);
      doc.text(`Bank Name: ${pi.bankDetails?.bankName || 'State Bank of India'}`, 50, y + 23);
      doc.text(`A/C Name: ${pi.bankDetails?.accountName || 'Cryo Scientific Systems Pvt. Ltd.'}`, 50, y + 36);
      doc.text(`A/C No: ${pi.bankDetails?.accountNumber || '382910482910'}`, 280, y + 23);
      doc.text(`IFSC Code: ${pi.bankDetails?.ifscCode || 'SBIN0001824'} | Branch: ${pi.bankDetails?.branch || 'Ambattur, Chennai'}`, 280, y + 36);

      // Sign-off
      y += 85;
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827');
      doc.text('For CRYO SCIENTIFIC SYSTEMS PVT. LTD.', 340, y);
      doc.font('Helvetica').fontSize(8).text('Finance & Accounts Division', 340, y + 45);

      doc.end();
      stream.on('finish', () => resolve(`/uploads/pdfs/${fileName}`));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

// Generate Sales Order PDF
const generateSalesOrderPDF = (so) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `${so.soNumber}.pdf`;
      const filePath = path.join(pdfDir, fileName);
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header Banner
      doc.rect(40, 40, 515, 65).fill('#0f2d59');
      doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('CRYO SCIENTIFIC SYSTEMS PVT. LTD.', 55, 52);
      doc.fontSize(9).font('Helvetica').text('Specialists in Ultra-Low Temperature & Medical Refrigeration Systems', 55, 75);
      doc.text('Ambattur Industrial Estate, Chennai - 600058 | PLANT RELEASE & EXECUTION ORDER', 55, 87);

      doc.moveDown(2);
      doc.fillColor('#0f2d59').fontSize(16).font('Helvetica-Bold').text('INTERNAL SALES ORDER (SO)', 40, 120, { align: 'center' });

      // Info Grid
      doc.rect(40, 145, 515, 85).strokeColor('#d1d5db').stroke();
      doc.fillColor('#1f2937').fontSize(9).font('Helvetica-Bold');
      doc.text(`SO Number: ${so.soNumber}`, 50, 155);
      doc.font('Helvetica').text(`SO Date: ${new Date(so.soDate).toLocaleDateString('en-GB')}`, 50, 170);
      doc.text(`Customer PO: ${so.customerPoNumber}`, 50, 185);
      doc.text(`Delivery Target: ${new Date(so.deliveryDate).toLocaleDateString('en-GB')}`, 50, 200);
      doc.text(`Order Type: ${so.orderType || 'Standard Equipment'}`, 50, 215);

      doc.font('Helvetica-Bold').text('Customer & Shipping Details:', 310, 155);
      doc.font('Helvetica').text(`${so.customerName}`, 310, 170);
      doc.text(`Ship To: ${so.shippingAddress || so.billingAddress || 'Factory Site'}`, 310, 185, { width: 230 });

      // Products Table Header
      let y = 245;
      doc.rect(40, y, 515, 20).fill('#e5e7eb');
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8);
      doc.text('#', 45, y + 6);
      doc.text('Equipment Model & Production Specs', 65, y + 6);
      doc.text('Qty', 320, y + 6);
      doc.text('Unit Price', 360, y + 6);
      doc.text('Total Amount', 465, y + 6);

      y += 24;
      doc.font('Helvetica').fontSize(8).fillColor('#374151');

      so.products.forEach((prod, index) => {
        const itemHeight = 32;
        doc.rect(40, y - 2, 515, itemHeight).strokeColor('#f3f4f6').stroke();
        doc.text(`${index + 1}`, 45, y + 4);
        doc.font('Helvetica-Bold').text(`${prod.productName} [${prod.model || 'Standard'}]`, 65, y + 4, { width: 245 });
        doc.font('Helvetica').text(`${prod.technicalSpecification || 'Standard Production Assembly'}`, 65, y + 14, { width: 245 });
        doc.text(`${prod.quantity} ${prod.unit || 'Nos'}`, 320, y + 4);
        doc.text(`₹${(prod.unitPrice || 0).toLocaleString('en-IN')}`, 360, y + 4);
        doc.font('Helvetica-Bold').text(`₹${(prod.totalAmount || 0).toLocaleString('en-IN')}`, 465, y + 4);
        y += itemHeight + 4;
      });

      // Commercial & Advance Summary
      y += 10;
      doc.rect(40, y, 515, 45).strokeColor('#d1d5db').stroke();
      doc.font('Helvetica').fontSize(9).fillColor('#374151');
      doc.text(`Total Order Value: ₹${(so.soValue || 0).toLocaleString('en-IN')}`, 50, y + 8);
      doc.text(`Advance Required: ₹${(so.advanceRequired || 0).toLocaleString('en-IN')}`, 50, y + 24);
      doc.text(`Advance Received: ₹${(so.advanceReceived || 0).toLocaleString('en-IN')}`, 240, y + 8);
      doc.text(`Balance Payable: ₹${(so.balanceAmount || 0).toLocaleString('en-IN')}`, 240, y + 24);
      doc.font('Helvetica-Bold').text(`Status: ${so.soStatus.toUpperCase()}`, 400, y + 15);

      // Department Approvals Table
      y += 60;
      doc.fillColor('#0f2d59').font('Helvetica-Bold').fontSize(10).text('MULTI-DEPARTMENT CLEARANCE RECORD:', 40, y);
      y += 15;
      doc.rect(40, y, 515, 20).fill('#e5e7eb');
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8);
      doc.text('Department', 50, y + 6);
      doc.text('Approval Status', 180, y + 6);
      doc.text('Authorized Approver', 310, y + 6);
      doc.text('Approval Date', 440, y + 6);

      y += 24;
      const deptList = [
        { name: 'Sales & Marketing', data: so.approvals?.salesApproval },
        { name: 'Finance & Accounts', data: so.approvals?.accountsApproval },
        { name: 'Technical & Engineering', data: so.approvals?.technicalApproval },
        { name: 'Production Feasibility', data: so.approvals?.productionFeasibilityApproval },
        { name: 'Management / MD', data: so.approvals?.managementApproval }
      ];

      deptList.forEach((dept) => {
        doc.rect(40, y - 2, 515, 20).strokeColor('#f3f4f6').stroke();
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#374151').text(dept.name, 50, y + 4);
        const status = dept.data?.status || 'Pending';
        doc.font('Helvetica-Bold').fillColor(status === 'Approved' ? '#059669' : status === 'Rejected' ? '#dc2626' : '#d97706');
        doc.text(status, 180, y + 4);
        doc.font('Helvetica').fillColor('#374151');
        doc.text(dept.data?.approvedByName || 'Pending Authorization', 310, y + 4);
        doc.text(dept.data?.approvedAt ? new Date(dept.data.approvedAt).toLocaleDateString('en-GB') : '-', 440, y + 4);
        y += 22;
      });

      // Release Notice
      y += 20;
      doc.rect(40, y, 515, 40).fill(so.releaseForExecution?.isReleased ? '#ecfdf5' : '#fef3c7').stroke();
      doc.fillColor('#065f46').font('Helvetica-Bold').fontSize(9);
      if (so.releaseForExecution?.isReleased) {
        doc.text(`CONFIRMED & OFFICIALLY RELEASED FOR PRODUCTION`, 50, y + 10);
        doc.font('Helvetica').fontSize(8).text(`Released on: ${new Date(so.releaseForExecution.releasedAt).toLocaleDateString('en-GB')} | Factory Floor Routing Active`, 50, y + 24);
      } else {
        doc.fillColor('#92400e').text(`ORDER PENDING FULL DEPARTMENTAL CLEARANCE`, 50, y + 10);
        doc.font('Helvetica').fontSize(8).text(`Factory execution is held until all commercial, payment, and technical approvals are satisfied.`, 50, y + 24);
      }

      doc.end();
      stream.on('finish', () => resolve(`/uploads/pdfs/${fileName}`));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateQuotationPDF,
  generateProformaInvoicePDF,
  generateSalesOrderPDF
};
