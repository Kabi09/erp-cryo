const Enquiry = require('../models/Enquiry');
const Customer = require('../models/Customer');
const Quotation = require('../models/Quotation');
const SalesOrder = require('../models/SalesOrder');
const FollowUp = require('../models/FollowUp');
const LeadDecision = require('../models/LeadDecision');
const Estimation = require('../models/Estimation');
const ProformaInvoice = require('../models/ProformaInvoice');
const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const PaymentReceipt = require('../models/PaymentReceipt');

// @desc Generate dynamic reports data based on report type and date ranges
// @route GET /api/reports/:reportType
exports.getReportData = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { startDate, endDate, status } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));

    let data = [];
    let summary = {};

    switch (reportType) {
      case 'enquiry-register': {
        const query = {};
        if (startDate || endDate) query.enquiryDate = dateFilter;
        if (status) query.status = status;
        data = await Enquiry.find(query).sort({ enquiryDate: -1 }).select('enquiryNumber enquiryDate companyName contactPerson mobileNumber email enquirySource status priority');
        summary = { totalCount: data.length };
        break;
      }

      case 'customer-register': {
        const query = {};
        if (status) query.status = status;
        data = await Customer.find(query).sort({ createdAt: -1 });
        summary = { totalCustomers: data.length };
        break;
      }

      case 'quotation-register': {
        const query = {};
        if (startDate || endDate) query.quotationDate = dateFilter;
        if (status) query.status = status;
        data = await Quotation.find(query).sort({ quotationDate: -1 }).select('quotationNumber versionLabel quotationDate customerName enquiryNumber taxableAmount gstTotal grandTotal status validUntil');
        const totalVal = data.reduce((acc, q) => acc + (q.grandTotal || 0), 0);
        summary = { totalQuotations: data.length, totalValue: totalVal };
        break;
      }

      case 'sales-order-register': {
        const query = {};
        if (startDate || endDate) query.soDate = dateFilter;
        if (status) query.soStatus = status;
        data = await SalesOrder.find(query).sort({ soDate: -1 }).select('soNumber soDate customerName customerPoNumber soValue advanceReceived balanceAmount soStatus deliveryDate');
        const totalVal = data.reduce((acc, s) => acc + (s.soValue || 0), 0);
        const totalRec = data.reduce((acc, s) => acc + (s.advanceReceived || 0), 0);
        summary = { totalOrders: data.length, totalValue: totalVal, totalReceived: totalRec, outstanding: totalVal - totalRec };
        break;
      }

      case 'follow-up-report': {
        const query = {};
        if (startDate || endDate) query.followUpDate = dateFilter;
        data = await FollowUp.find(query).sort({ followUpDate: -1 }).populate('assignedTo', 'name');
        summary = { totalFollowUps: data.length };
        break;
      }

      case 'won-lost-report': {
        const query = {};
        if (startDate || endDate) query.decisionDate = dateFilter;
        if (status) query.leadStatus = status;
        data = await LeadDecision.find(query).sort({ decisionDate: -1 });
        const wonCount = data.filter((d) => d.leadStatus === 'Won').length;
        const lostCount = data.filter((d) => d.leadStatus === 'Lost').length;
        summary = { totalRecords: data.length, wonCount, lostCount };
        break;
      }

      case 'payment-receipt-report': {
        const query = {};
        if (startDate || endDate) query.paymentDate = dateFilter;
        if (status) query.status = status;
        data = await PaymentReceipt.find(query).sort({ paymentDate: -1 });
        const totalReceived = data.reduce((acc, p) => acc + (p.amountReceived || 0), 0);
        summary = { totalReceipts: data.length, totalAmountReceived: totalReceived };
        break;
      }

      case 'outstanding-payment-report': {
        data = await SalesOrder.find({ balanceAmount: { $gt: 0 }, soStatus: { $ne: 'Cancelled' } })
          .select('soNumber soDate customerName soValue advanceReceived balanceAmount paymentStatus deliveryDate')
          .sort({ balanceAmount: -1 });
        const totalOutstanding = data.reduce((acc, s) => acc + (s.balanceAmount || 0), 0);
        summary = { count: data.length, totalOutstanding };
        break;
      }

      default:
        return res.status(400).json({ success: false, message: 'Invalid report type requested' });
    }

    res.json({
      success: true,
      reportType,
      summary,
      count: data.length,
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
