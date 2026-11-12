const POVerification = require('../models/POVerification');
const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const Quotation = require('../models/Quotation');
const QuotationRevision = require('../models/QuotationRevision');
const Lead = require('../models/Lead');
const logActivity = require('../utils/activityLogger');

// @desc    Get verification history for a Lead / PO
// @route   GET /api/verifications/lead/:leadId
// @access  Private
exports.getVerificationsByLead = async (req, res, next) => {
  try {
    const verifications = await POVerification.find({ lead: req.params.leadId })
      .populate('verifiedBy', 'name email')
      .populate('quotationRevision', 'revisionLabel grandTotal')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: verifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single verification by ID
// @route   GET /api/verifications/:id
// @access  Private
exports.getVerificationById = async (req, res, next) => {
  try {
    const verification = await POVerification.findById(req.params.id)
      .populate('lead')
      .populate('customer')
      .populate('customerPO')
      .populate('quotation')
      .populate('quotationRevision')
      .populate('verifiedBy', 'name email');

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    res.status(200).json({ success: true, data: verification });
  } catch (error) {
    next(error);
  }
};

// @desc    Perform 5-point PO verification
// @route   POST /api/verifications
// @access  Private
exports.createVerification = async (req, res, next) => {
  try {
    const {
      leadId,
      customerPOId,
      quotationId,
      checks, // { itemSpecification, quantity, pricingValue, deliveryDate, paymentTerms }
      generalRemarks
    } = req.body;

    if (!leadId || !customerPOId || !checks) {
      return res.status(400).json({
        success: false,
        message: 'Lead ID, Customer PO ID, and all 5 verification checks are required'
      });
    }

    const {
      itemSpecification,
      quantity,
      pricingValue,
      deliveryDate,
      paymentTerms
    } = checks;

    if (!itemSpecification || !quantity || !pricingValue || !deliveryDate || !paymentTerms) {
      return res.status(400).json({
        success: false,
        message: 'All 5 verification points must be provided'
      });
    }

    const po = await CustomerPurchaseOrder.findById(customerPOId);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Customer PO not found' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const quote = await Quotation.findById(quotationId || po.quotation).populate('winningRevision activeRevision');
    const winningRev = quote?.winningRevision || quote?.activeRevision;

    // Determine if all 5 points match
    const pointStatuses = [
      itemSpecification.status,
      quantity.status,
      pricingValue.status,
      deliveryDate.status,
      paymentTerms.status
    ];

    const allMatched = pointStatuses.every((st) => st === 'MATCH');
    const overallStatus = allMatched ? 'PASSED' : 'FAILED_MISMATCH';

    // Count previous verifications to set round
    const previousRounds = await POVerification.countDocuments({ customerPO: po._id });
    const verificationRound = previousRounds + 1;

    const verification = await POVerification.create({
      lead: lead._id,
      customer: po.customer,
      customerPO: po._id,
      quotation: quote?._id,
      quotationRevision: winningRev?._id,
      verificationRound,
      checks: {
        itemSpecification: {
          pointNumber: 1,
          pointName: 'Item / Product Name and Specification',
          expectedValue: itemSpecification.expectedValue || 'As per approved quote',
          actualValue: itemSpecification.actualValue || 'As per customer PO',
          status: itemSpecification.status,
          remarks: itemSpecification.remarks || ''
        },
        quantity: {
          pointNumber: 2,
          pointName: 'Quantity',
          expectedValue: quantity.expectedValue || 'As per approved quote',
          actualValue: quantity.actualValue || 'As per customer PO',
          status: quantity.status,
          remarks: quantity.remarks || ''
        },
        pricingValue: {
          pointNumber: 3,
          pointName: 'Unit Price and Total Value',
          expectedValue: pricingValue.expectedValue || 'As per approved quote',
          actualValue: pricingValue.actualValue || 'As per customer PO',
          status: pricingValue.status,
          remarks: pricingValue.remarks || ''
        },
        deliveryDate: {
          pointNumber: 4,
          pointName: 'Delivery Date',
          expectedValue: deliveryDate.expectedValue || 'As per approved quote',
          actualValue: deliveryDate.actualValue || 'As per customer PO',
          status: deliveryDate.status,
          remarks: deliveryDate.remarks || ''
        },
        paymentTerms: {
          pointNumber: 5,
          pointName: 'Payment Terms',
          expectedValue: paymentTerms.expectedValue || 'As per approved quote',
          actualValue: paymentTerms.actualValue || 'As per customer PO',
          status: paymentTerms.status,
          remarks: paymentTerms.remarks || ''
        }
      },
      allMatched,
      overallStatus,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      generalRemarks: generalRemarks || ''
    });

    // Update PO status
    po.verificationStatus = allMatched ? 'Passed' : 'Failed_Mismatch';
    await po.save();

    // Update Lead stage
    if (allMatched) {
      lead.stage = 'PO_VERIFICATION';
      await lead.save();

      await logActivity({
        leadId: lead._id,
        activityType: 'PO_VERIFICATION_PASSED',
        title: `Five-Point PO Verification Passed (Round ${verificationRound})`,
        description: `Customer PO ${po.poNumber} verified successfully. All 5 points match approved quotation ${quote?.quotationNumber || ''}. Sales Order can now be created.`,
        userId: req.user._id,
        documentType: 'POVerification',
        documentId: verification._id,
        metadata: { round: verificationRound, status: 'PASSED' }
      });
    } else {
      lead.stage = 'PO_AMENDMENT_PENDING';
      await lead.save();

      // Find which points failed
      const mismatchedPoints = [];
      if (itemSpecification.status === 'MISMATCH') mismatchedPoints.push('Item/Spec');
      if (quantity.status === 'MISMATCH') mismatchedPoints.push('Quantity');
      if (pricingValue.status === 'MISMATCH') mismatchedPoints.push('Price/Value');
      if (deliveryDate.status === 'MISMATCH') mismatchedPoints.push('Delivery Date');
      if (paymentTerms.status === 'MISMATCH') mismatchedPoints.push('Payment Terms');

      await logActivity({
        leadId: lead._id,
        activityType: 'PO_VERIFICATION_FAILED',
        title: `PO Verification Mismatch Detected (Round ${verificationRound})`,
        description: `Mismatches identified in points: ${mismatchedPoints.join(', ')}. Sales Order creation blocked until PO amendment is completed. Remarks: ${generalRemarks || 'Mismatches need correction'}`,
        userId: req.user._id,
        documentType: 'POVerification',
        documentId: verification._id,
        metadata: { round: verificationRound, status: 'FAILED_MISMATCH', mismatchedPoints }
      });
    }

    res.status(201).json({
      success: true,
      message: allMatched
        ? 'All 5 points successfully verified and matched! Sales Order can now be created.'
        : 'PO verification failed due to mismatches. Sales Order creation is blocked until PO Amendment is submitted.',
      data: verification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request PO Amendment from Customer
// @route   POST /api/verifications/:id/request-amendment
// @access  Private
exports.requestAmendment = async (req, res, next) => {
  try {
    const { amendmentNotes } = req.body;
    const verification = await POVerification.findById(req.params.id).populate('customerPO lead');
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    if (verification.allMatched) {
      return res.status(400).json({
        success: false,
        message: 'Cannot request amendment for a PO that already passed verification'
      });
    }

    const po = await CustomerPurchaseOrder.findById(verification.customerPO);
    if (po) {
      po.verificationStatus = 'Amendment_Requested';
      await po.save();
    }

    const lead = await Lead.findById(verification.lead);
    if (lead) {
      lead.stage = 'PO_AMENDMENT_PENDING';
      await lead.save();

      await logActivity({
        leadId: lead._id,
        activityType: 'PO_AMENDMENT_REQUESTED',
        title: 'PO Amendment Officially Requested',
        description: `Customer requested to issue amended PO for mismatches identified in verification round ${verification.verificationRound}. Notes: ${amendmentNotes || 'Amendment requested'}`,
        userId: req.user._id,
        documentType: 'POVerification',
        documentId: verification._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'PO amendment request logged successfully',
      data: verification
    });
  } catch (error) {
    next(error);
  }
};

