import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const orderTypes = ['Standard Equipment', 'Custom Engineering', 'Turnkey Cold Room Project', 'AMC / Service Contract'];
const priorities = ['Normal', 'High', 'Urgent / VIP'];

const SalesOrderFormModal = ({ isOpen, onClose, onSaved }) => {
  const [quotations, setQuotations] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);

  const [formData, setFormData] = useState({
    customerPoNumber: '',
    customerPoDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    orderType: 'Standard Equipment',
    priority: 'Normal',
    billingAddress: '',
    shippingAddress: '',
    projectLocation: '',
    advanceRequired: 0,
    paymentTerms: ''
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
        billingAddress: q.billingAddress || '',
        shippingAddress: q.shippingAddress || q.billingAddress || '',
        advanceRequired: Math.round((q.grandTotal || 0) * 0.3),
        paymentTerms: q.commercialTerms?.paymentTerms || '30% Advance, 70% against delivery/PI'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuoteId) {
      setError('Please select an accepted quotation');
      return;
    }
    if (!formData.customerPoNumber) {
      setError('Please specify Customer PO Number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/sales-orders', {
        ...formData,
        quotation: selectedQuoteId
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating Sales Order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Internal Sales Order (SO)" maxWidth="max-w-3xl">
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
            <option value="">-- Choose Accepted Quotation --</option>
            {quotations.map(q => (
              <option key={q._id} value={q._id}>
                {q.quotationNumber} ({q.versionLabel}) — {q.customerName} (₹{(q.grandTotal || 0).toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        {selectedQuote && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">{selectedQuote.customerName}</span>
              <span className="text-[11px] text-slate-500 block">{selectedQuote.products?.length || 1} Product Line Items</span>
            </div>
            <span className="font-extrabold text-brand-900 text-base">
              ₹{(selectedQuote.grandTotal || 0).toLocaleString('en-IN')}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer PO Number *</label>
            <input
              type="text"
              required
              value={formData.customerPoNumber}
              onChange={(e) => setFormData({ ...formData, customerPoNumber: e.target.value })}
              placeholder="e.g. APEX/PO/2026/019"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer PO Date</label>
            <input
              type="date"
              value={formData.customerPoDate}
              onChange={(e) => setFormData({ ...formData, customerPoDate: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Committed Delivery Target Date *</label>
            <input
              type="date"
              required
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Order Execution Category</label>
            <select
              value={formData.orderType}
              onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            >
              {orderTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Manufacturing Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            >
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Shipping & Plant Delivery Address</label>
          <input
            type="text"
            value={formData.shippingAddress}
            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
            placeholder="Factory site location..."
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={CheckCircle2}>
            Create SO & Initiate Clearances
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SalesOrderFormModal;
