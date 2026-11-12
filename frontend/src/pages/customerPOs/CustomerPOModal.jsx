import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { ShoppingCart } from 'lucide-react';
import api from '../../services/api';

const CustomerPOModal = ({ isOpen, onClose, onSaved }) => {
  const [quotations, setQuotations] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);

  const [formData, setFormData] = useState({
    customerPoNumber: '',
    customerPoDate: new Date().toISOString().split('T')[0],
    poValue: 0,
    currency: 'INR',
    deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: '',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/quotations?status=Accepted').then(res => {
        if (res.data.success) setQuotations(res.data.data);
      });
    }
  }, [isOpen]);

  const handleQuoteChange = (qId) => {
    setSelectedQuoteId(qId);
    const q = quotations.find(item => item._id === qId);
    setSelectedQuote(q || null);
    if (q) {
      setFormData(prev => ({
        ...prev,
        poValue: q.grandTotal || 0,
        paymentTerms: q.commercialTerms?.paymentTerms || ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuoteId) {
      setError('Please select an accepted quotation');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/customer-pos', {
        ...formData,
        quotation: selectedQuoteId
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording customer PO');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Customer Purchase Order (PO)" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Select Accepted Quotation Reference *</label>
          <select
            value={selectedQuoteId}
            onChange={(e) => handleQuoteChange(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:bg-white"
          >
            <option value="">-- Select Accepted Quotation --</option>
            {quotations.map(q => (
              <option key={q._id} value={q._id}>
                {q.quotationNumber} ({q.versionLabel}) — {q.customerName} (₹{(q.grandTotal || 0).toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer PO Number *</label>
            <input
              type="text"
              required
              value={formData.customerPoNumber}
              onChange={(e) => setFormData({ ...formData, customerPoNumber: e.target.value })}
              placeholder="e.g. APEX/PUR/2026/0892"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer PO Date *</label>
            <input
              type="date"
              required
              value={formData.customerPoDate}
              onChange={(e) => setFormData({ ...formData, customerPoDate: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total PO Amount (INR) *</label>
            <input
              type="number"
              required
              value={formData.poValue}
              onChange={(e) => setFormData({ ...formData, poValue: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Required Delivery Date</label>
            <input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Stated PO Payment Terms</label>
          <input
            type="text"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            placeholder="30% Advance, 70% against delivery"
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Notes / Discrepancy Warnings</label>
          <textarea
            rows={2}
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="Any special remarks or delivery clauses mentioned on the customer PO..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:bg-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={ShoppingCart}>
            Receive PO & Initiate Verification
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerPOModal;
