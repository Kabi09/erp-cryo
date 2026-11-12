const Counter = require('../models/Counter');

const getNextSequence = async (prefix) => {
  const currentYear = new Date().getFullYear();
  const key = `${prefix}-${currentYear}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );

  const paddedSequence = String(counter.sequenceValue).padStart(4, '0');
  return `${prefix}-${currentYear}-${paddedSequence}`;
};

const getCustomerCode = async () => {
  const key = 'CUST-CODE';
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  return `CUST-${String(counter.sequenceValue).padStart(4, '0')}`;
};

const getProductCode = async () => {
  const key = 'PRD-CODE';
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  return `CRY-${String(counter.sequenceValue).padStart(4, '0')}`;
};

module.exports = {
  getNextSequence,
  getCustomerCode,
  getProductCode
};
