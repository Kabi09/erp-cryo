const Estimation = require('../models/Estimation');
const Enquiry = require('../models/Enquiry');
const { getNextSequence } = require('../utils/generateDocNumber');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');

// @desc Get all estimations
// @route GET /api/estimations
exports.getEstimations = async (req, res) => {
  try {
    const { enquiryId, customerId, status } = req.query;
    let query = {};

    if (enquiryId) query.enquiry = enquiryId;
    if (customerId) query.customer = customerId;
    if (status) query.status = status;

    const estimations = await Estimation.find(query)
      .populate('enquiry', 'enquiryNumber companyName status')
      .populate('customer', 'companyName customerCode')
      .populate('preparedBy', 'name role')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: estimations.length, data: estimations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single estimation by ID
// @route GET /api/estimations/:id
exports.getEstimationById = async (req, res) => {
  try {
    const estimation = await Estimation.findById(req.params.id)
      .populate('enquiry')
      .populate('customer')
      .populate('preparedBy', 'name role department')
      .populate('reviewedBy', 'name role department');

    if (!estimation) {
      return res.status(404).json({ success: false, message: 'Estimation not found' });
    }

    res.json({ success: true, data: estimation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Estimation
// @route POST /api/estimations
exports.createEstimation = async (req, res) => {
  try {
    const { enquiry: enquiryId, customer: customerId, customerName, items } = req.body;

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Referenced Enquiry not found' });
    }

    const estimateNumber = await getNextSequence('EST');

    // Calculate item and grand totals
    let calculatedTotalCost = 0;
    let calculatedSellingPrice = 0;
    let calculatedGst = 0;
    let calculatedGrandTotal = 0;

    const processedItems = (items || []).map((item) => {
      let costSum = 0;
      let rawMat = 0, sensors = 0, heating = 0, controllers = 0, elec = 0, labour = 0, mfg = 0, test = 0, pack = 0, transp = 0, oth = 0;

      (item.costingLines || []).forEach((line) => {
        const lineTotal = (Number(line.quantity) || 1) * (Number(line.unitPrice) || 0);
        line.totalAmount = lineTotal;
        costSum += lineTotal;

        if (line.category === 'Raw Materials') rawMat += lineTotal;
        else if (line.category === 'Sensors') sensors += lineTotal;
        else if (line.category === 'Heating Elements') heating += lineTotal;
        else if (line.category === 'Controllers') controllers += lineTotal;
        else if (line.category === 'Electrical Components') elec += lineTotal;
        else if (line.category === 'Labour') labour += lineTotal;
        else if (line.category === 'Manufacturing') mfg += lineTotal;
        else if (line.category === 'Testing & Calibration') test += lineTotal;
        else if (line.category === 'Packing') pack += lineTotal;
        else if (line.category === 'Transportation') transp += lineTotal;
        else oth += lineTotal;
      });

      const totalItemCost = costSum || Number(item.totalEstimatedCost) || 0;
      const marginPct = Number(item.profitMarginPercent) || 25;
      const profitAmt = (totalItemCost * marginPct) / 100;
      const sellPrice = totalItemCost + profitAmt;
      const gstPct = Number(item.gstPercent) || 18;
      const gstAmt = (sellPrice * gstPct) / 100;
      const finalAmt = sellPrice + gstAmt;

      calculatedTotalCost += totalItemCost;
      calculatedSellingPrice += sellPrice;
      calculatedGst += gstAmt;
      calculatedGrandTotal += finalAmt;

      return {
        ...item,
        materialCost: rawMat,
        sensorsCost: sensors,
        heatingCost: heating,
        controllersCost: controllers,
        electricalCost: elec,
        labourCost: labour,
        manufacturingCost: mfg,
        testingCost: test,
        packingCost: pack,
        transportationCost: transp,
        otherCost: oth,
        totalEstimatedCost: totalItemCost,
        profitAmount: profitAmt,
        sellingPrice: sellPrice,
        gstAmount: gstAmt,
        finalEstimatedAmount: finalAmt
      };
    });

    const estimation = await Estimation.create({
      estimateNumber,
      enquiry: enquiry._id,
      enquiryNumber: enquiry.enquiryNumber,
      customer: customerId || enquiry.customer,
      customerName: customerName || enquiry.companyName,
      items: processedItems,
      totalCost: calculatedTotalCost,
      totalProfit: calculatedSellingPrice - calculatedTotalCost,
      totalSellingPrice: calculatedSellingPrice,
      totalGst: calculatedGst,
      grandTotal: calculatedGrandTotal,
      preparedBy: req.user?._id,
      status: 'Pending Approval',
      revisionNumber: 1
    });

    enquiry.status = 'Under Estimation';
    await enquiry.save();

    await logAudit(req, 'CREATE', 'Estimation', estimation._id.toString(), { estimateNumber, grandTotal: calculatedGrandTotal });

    // Notify Engineering Manager / Sales Manager
    await Notification.create({
      title: 'New Estimation Pending Approval',
      message: `Estimation ${estimateNumber} for ${enquiry.enquiryNumber} (${enquiry.companyName}) awaits engineering review.`,
      link: `/estimations/${estimation._id}`,
      type: 'Estimation',
      targetRoles: ['Engineering Manager', 'Sales Manager']
    });

    res.status(201).json({ success: true, data: estimation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update / Revise Estimation
// @route PUT /api/estimations/:id
exports.updateEstimation = async (req, res) => {
  try {
    const estimation = await Estimation.findById(req.params.id);
    if (!estimation) {
      return res.status(404).json({ success: false, message: 'Estimation not found' });
    }

    // Save previous state to revision history
    estimation.revisionHistory.push({
      revisionNumber: estimation.revisionNumber,
      totalCost: estimation.totalCost,
      grandTotal: estimation.grandTotal,
      updatedBy: req.user?._id,
      updatedAt: new Date(),
      reason: req.body.revisionReason || 'Costing adjustments'
    });

    estimation.revisionNumber = (estimation.revisionNumber || 1) + 1;

    // Recalculate
    const items = req.body.items || estimation.items;
    let calculatedTotalCost = 0;
    let calculatedSellingPrice = 0;
    let calculatedGst = 0;
    let calculatedGrandTotal = 0;

    const processedItems = items.map((item) => {
      let costSum = 0;
      (item.costingLines || []).forEach((line) => {
        const lineTotal = (Number(line.quantity) || 1) * (Number(line.unitPrice) || 0);
        line.totalAmount = lineTotal;
        costSum += lineTotal;
      });

      const totalItemCost = costSum || Number(item.totalEstimatedCost) || 0;
      const marginPct = Number(item.profitMarginPercent) || 25;
      const profitAmt = (totalItemCost * marginPct) / 100;
      const sellPrice = totalItemCost + profitAmt;
      const gstPct = Number(item.gstPercent) || 18;
      const gstAmt = (sellPrice * gstPct) / 100;
      const finalAmt = sellPrice + gstAmt;

      calculatedTotalCost += totalItemCost;
      calculatedSellingPrice += sellPrice;
      calculatedGst += gstAmt;
      calculatedGrandTotal += finalAmt;

      return {
        ...item,
        totalEstimatedCost: totalItemCost,
        profitAmount: profitAmt,
        sellingPrice: sellPrice,
        gstAmount: gstAmt,
        finalEstimatedAmount: finalAmt
      };
    });

    estimation.items = processedItems;
    estimation.totalCost = calculatedTotalCost;
    estimation.totalProfit = calculatedSellingPrice - calculatedTotalCost;
    estimation.totalSellingPrice = calculatedSellingPrice;
    estimation.totalGst = calculatedGst;
    estimation.grandTotal = calculatedGrandTotal;
    estimation.status = 'Pending Approval';
    await estimation.save();

    await logAudit(req, 'REVISE', 'Estimation', estimation._id.toString(), {
      estimateNumber: estimation.estimateNumber,
      revision: estimation.revisionNumber
    });

    res.json({ success: true, data: estimation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Approve or Reject Estimation
// @route PATCH /api/estimations/:id/review
exports.reviewEstimation = async (req, res) => {
  try {
    const { status, reviewRemarks } = req.body;
    const estimation = await Estimation.findById(req.params.id);

    if (!estimation) {
      return res.status(404).json({ success: false, message: 'Estimation not found' });
    }

    estimation.status = status; // 'Approved' or 'Rejected'
    estimation.reviewedBy = req.user?._id;
    estimation.reviewRemarks = reviewRemarks;
    await estimation.save();

    if (status === 'Approved') {
      await Enquiry.findByIdAndUpdate(estimation.enquiry, { status: 'Estimation Completed' });
    }

    await logAudit(req, status === 'Approved' ? 'APPROVE' : 'REJECT', 'Estimation', estimation._id.toString(), {
      estimateNumber: estimation.estimateNumber,
      reviewRemarks
    });

    res.json({ success: true, data: estimation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
