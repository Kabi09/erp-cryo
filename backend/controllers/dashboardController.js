const Enquiry = require('../models/Enquiry');
const Estimation = require('../models/Estimation');
const FollowUp = require('../models/FollowUp');
const Quotation = require('../models/Quotation');
const Negotiation = require('../models/Negotiation');
const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const PaymentReceipt = require('../models/PaymentReceipt');
const SalesOrder = require('../models/SalesOrder');
const LeadDecision = require('../models/LeadDecision');
const Customer = require('../models/Customer');

// @desc Get complete Dashboard Summary Cards & Aggregated Metrics
// @route GET /api/dashboard/summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalEnquiries,
      newEnquiries,
      todayFollowUps,
      overdueFollowUps,
      pendingEstimations,
      quotationsSent,
      pendingQuotations,
      wonOpportunities,
      lostOpportunities,
      activeNegotiations,
      pendingCustomerPOs,
      pendingPayments,
      confirmedSalesOrders,
      salesOrdersAgg
    ] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: { $in: ['Draft', 'Submitted'] } }),
      FollowUp.countDocuments({ nextFollowUpDate: { $gte: todayStart, $lte: todayEnd } }),
      FollowUp.countDocuments({ nextFollowUpDate: { $lt: todayStart }, status: { $ne: 'Completed' } }),
      Estimation.countDocuments({ status: 'Pending Approval' }),
      Quotation.countDocuments({ status: 'Sent' }),
      Quotation.countDocuments({ status: { $in: ['Draft', 'Pending Approval'] } }),
      LeadDecision.countDocuments({ leadStatus: 'Won' }),
      LeadDecision.countDocuments({ leadStatus: 'Lost' }),
      Negotiation.countDocuments({ managerApprovalStatus: 'Pending' }),
      CustomerPurchaseOrder.countDocuments({ verificationStatus: { $in: ['Pending', 'Mismatch'] } }),
      PaymentReceipt.countDocuments({ status: 'Pending Verification' }),
      SalesOrder.countDocuments({ soStatus: { $in: ['Confirmed', 'Released to Production', 'In Manufacturing'] } }),
      SalesOrder.aggregate([
        { $match: { soStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalValue: { $sum: '$soValue' }, count: { $sum: 1 } } }
      ])
    ]);

    const totalSOValue = salesOrdersAgg[0]?.totalValue || 0;

    res.json({
      success: true,
      data: {
        totalEnquiries,
        newEnquiries,
        todayFollowUps,
        overdueFollowUps,
        pendingEstimations,
        quotationsSent,
        pendingQuotations,
        wonOpportunities,
        lostOpportunities,
        activeNegotiations,
        pendingCustomerPOs,
        pendingPayments,
        confirmedSalesOrders,
        totalSalesOrderValue: totalSOValue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get Dashboard Charts Data (Monthly Trends, Conversions, Performance)
// @route GET /api/dashboard/charts
exports.getDashboardCharts = async (req, res) => {
  try {
    // 1. Monthly Enquiries & Monthly Sales Trends (Last 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyEnquiriesAgg = await Enquiry.aggregate([
      { $match: { enquiryDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$enquiryDate' }, month: { $month: '$enquiryDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlySalesAgg = await SalesOrder.aggregate([
      { $match: { soDate: { $gte: sixMonthsAgo }, soStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$soDate' }, month: { $month: '$soDate' } },
          totalSales: { $sum: '$soValue' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Build 6-month continuous series
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mNum = d.getMonth() + 1;
      const yNum = d.getFullYear();
      const label = `${monthNames[mNum - 1]} ${yNum}`;

      const enq = monthlyEnquiriesAgg.find((e) => e._id.year === yNum && e._id.month === mNum)?.count || 0;
      const sale = monthlySalesAgg.find((s) => s._id.year === yNum && s._id.month === mNum)?.totalSales || 0;

      monthlyTrends.push({
        month: label,
        enquiries: enq,
        salesAmount: sale
      });
    }

    // 2. Won vs Lost Leads
    const leadStats = await LeadDecision.aggregate([
      { $group: { _id: '$leadStatus', count: { $sum: 1 } } }
    ]);
    const wonVsLost = [
      { name: 'Won Leads', value: leadStats.find((l) => l._id === 'Won')?.count || 0, fill: '#10b981' },
      { name: 'Lost Leads', value: leadStats.find((l) => l._id === 'Lost')?.count || 0, fill: '#ef4444' },
      { name: 'On Hold', value: leadStats.find((l) => l._id === 'On Hold')?.count || 0, fill: '#f59e0b' }
    ];

    // 3. Customer-wise Sales (Top 5)
    const customerSales = await SalesOrder.aggregate([
      { $match: { soStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: '$customerName', totalValue: { $sum: '$soValue' } } },
      { $sort: { totalValue: -1 } },
      { $limit: 5 },
      { $project: { customerName: '$_id', totalValue: 1, _id: 0 } }
    ]);

    // 4. Product Category Wise Enquiries / Sales
    const productSales = await SalesOrder.aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productName',
          revenue: { $sum: '$products.totalAmount' },
          quantity: { $sum: '$products.quantity' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 }
    ]);

    // 5. Sales Conversion Rates
    const totalEnquiriesCount = await Enquiry.countDocuments();
    const wonCount = await LeadDecision.countDocuments({ leadStatus: 'Won' });
    const quotationsCount = await Quotation.countDocuments();
    const acceptedQuotations = await Quotation.countDocuments({ status: 'Accepted' });

    const conversionRates = {
      enquiryConversionRate: totalEnquiriesCount > 0 ? ((wonCount / totalEnquiriesCount) * 100).toFixed(1) : 0,
      quotationConversionRate: quotationsCount > 0 ? ((acceptedQuotations / quotationsCount) * 100).toFixed(1) : 0
    };

    res.json({
      success: true,
      data: {
        monthlyTrends,
        wonVsLost,
        customerSales,
        productSales,
        conversionRates
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get Recent Activities for Dashboard
// @route GET /api/dashboard/activities
exports.getDashboardActivities = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [recentEnquiries, todayFollowUps, overdueFollowUps, recentQuotations, pendingApprovals, recentSalesOrders] = await Promise.all([
      Enquiry.find().sort({ createdAt: -1 }).limit(5).select('enquiryNumber companyName status priority createdAt products'),
      FollowUp.find({ nextFollowUpDate: { $gte: todayStart, $lte: todayEnd } }).limit(5).populate('assignedTo', 'name'),
      FollowUp.find({ nextFollowUpDate: { $lt: todayStart }, status: { $ne: 'Completed' } }).limit(5).populate('assignedTo', 'name'),
      Quotation.find().sort({ createdAt: -1 }).limit(5).select('quotationNumber versionLabel customerName grandTotal status createdAt'),
      SalesOrder.find({ soStatus: 'Pending Approvals' }).limit(5).select('soNumber customerName soValue priority deliveryDate approvals'),
      SalesOrder.find().sort({ createdAt: -1 }).limit(5).select('soNumber customerName soValue soStatus deliveryDate')
    ]);

    res.json({
      success: true,
      data: {
        recentEnquiries,
        todayFollowUps,
        overdueFollowUps,
        recentQuotations,
        pendingApprovals,
        recentSalesOrders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
