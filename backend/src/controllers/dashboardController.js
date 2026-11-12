const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const ProformaInvoice = require('../models/ProformaInvoice');
const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const SalesOrder = require('../models/SalesOrder');
const Activity = require('../models/Activity');

// @desc    Get dashboard metrics, pipeline summary, and recent activities
// @route   GET /api/dashboard/metrics
// @access  Private
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalLeads,
      newEnquiries,
      qualifiedLeads,
      quotationsPending,
      quotationsWon,
      quotationsLost,
      piGenerated,
      customerPOReceived,
      poVerificationPending,
      salesOrdersCreated,
      handedOverToProduction,
      recentActivities,
      pipelineBreakdown
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'New' }),
      Lead.countDocuments({ 'qualification.isQualified': true }),
      Quotation.countDocuments({ status: { $in: ['Draft', 'Sent', 'Customer Review', 'Under Negotiation'] } }),
      Quotation.countDocuments({ status: 'Won' }),
      Quotation.countDocuments({ status: 'Lost' }),
      ProformaInvoice.countDocuments(),
      CustomerPurchaseOrder.countDocuments(),
      CustomerPurchaseOrder.countDocuments({ verificationStatus: { $in: ['Unverified', 'Failed_Mismatch', 'Amendment_Requested'] } }),
      SalesOrder.countDocuments(),
      SalesOrder.countDocuments({ 'productionHandover.isHandedOver': true }),
      Activity.find()
        .populate('user', 'name email department')
        .populate('lead', 'leadNumber companyName')
        .sort({ createdAt: -1 })
        .limit(10),
      Lead.aggregate([
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format pipeline stages
    const stageOrder = [
      'ENQUIRY_RECEIVED',
      'QUALIFICATION',
      'CUSTOMER_MAPPED',
      'QUOTATION_DRAFTED',
      'QUOTATION_SENT',
      'CUSTOMER_REVIEW',
      'QUOTATION_NEGOTIATION',
      'QUOTATION_WON',
      'PI_ISSUED',
      'PO_RECEIVED',
      'PO_VERIFICATION',
      'SO_CREATED',
      'PRODUCTION_HANDOVER'
    ];

    const stageMap = {};
    pipelineBreakdown.forEach((item) => {
      stageMap[item._id] = item.count;
    });

    const formattedPipeline = stageOrder.map((stg) => ({
      stage: stg,
      count: stageMap[stg] || 0
    }));

    // Calculate total pipeline value from Won & Active Quotations
    const pipelineValueAgg = await Quotation.aggregate([
      { $match: { status: { $in: ['Won', 'Sent', 'Customer Review', 'Under Negotiation'] } } },
      {
        $lookup: {
          from: 'quotationrevisions',
          localField: 'activeRevision',
          foreignField: '_id',
          as: 'activeRev'
        }
      },
      { $unwind: '$activeRev' },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$activeRev.grandTotal' }
        }
      }
    ]);

    const totalPipelineValue = pipelineValueAgg.length > 0 ? pipelineValueAgg[0].totalValue : 0;

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalLeads,
          newEnquiries,
          qualifiedLeads,
          quotationsPending,
          quotationsWon,
          quotationsLost,
          piGenerated,
          customerPOReceived,
          poVerificationPending,
          salesOrdersCreated,
          handedOverToProduction,
          totalPipelineValue
        },
        pipeline: formattedPipeline,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

