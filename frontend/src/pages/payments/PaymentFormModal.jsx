import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { CreditCard } from 'lucide-react';
import api from '../../services/api';

const paymentModes = ['NEFT', 'RTGS', 'IMPS', 'Cheque', 'Demand Draft', 'Wire Transfer / Swift', 'Other'];

const PaymentFormModal = ({ isOpen, onClose, onSaved }) => {
  const [customers, setCustomers] = useState([]);
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPIId, setSelectedPIId] = useState('');

  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'NEFT',
    transactionId: '',
    bankAccount: 'State Bank of India (A/C: 382910482910)',
    amountReceived: 0,
    tdsDeduction: 0,
    customerPoNumber: '',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/customers').then(res => {
        if (res.data.success) setCustomers(res.data.data);
      });
      api.get('/proforma-invoices').then(res => {
        if (res.data.success) setProformaInvoices(res.data.data);
      });
    }
  }, [isOpen]);

  const handlePIChange = (piId) => {
    setSelectedPIId(piId);
    const pi = proformaInvoices.find(p => p._id === piId);
    if (pi) {
      setSelectedCustomerId(pi.customer?._id || pi.customer);
      setFormData(prev => ({
        ...prev,
        amountReceived: pi.advanceAmount || pi.totalPiAmount || 0,
        customerPoNumber: pi.quotationNumber || ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }
    if (!formData.transactionId) {
      setError('Please provide transaction reference/UTR');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const customer = customers.find(c => c._id === selectedCustomerId);
      await api.post('/payments', {
        ...formData,
        customer: selectedCustomerId,
        customerName: customer?.companyName || 'Customer',
        proformaInvoice: selectedPIId || undefined
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error logging payment receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Customer Payment Receipt" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Customer *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:bg-white"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Link to Proforma Invoice (Optional)</label>
            <select
              value={selectedPIId}
              onChange={(e) => handlePIChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:bg-white"
            >
              <option value="">-- No PI Linked --</option>
              {proformaInvoices.map(p => (
                <option key={p._id} value={p._id}>
                  {p.piNumber} — {p.customerName} (₹{(p.totalPiAmount || 0).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Date *</label>
            <input
              type="date"
              required
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Mode *</label>
            <select
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            >
              {paymentModes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / UTR / Cheque # *</label>
            <input
              type="text"
              required
              placeholder="e.g. UTR1928472910"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Amount Received (INR) *</label>
            <input
              type="number"
              min={1}
              required
              value={formData.amountReceived}
              onChange={(e) => setFormData({ ...formData, amountReceived: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">TDS Deduction (if applicable)</label>
            <input
              type="number"
              value={formData.tdsDeduction}
              onChange={(e) => setFormData({ ...formData, tdsDeduction: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Deposited Company Bank Account</label>
          <input
            type="text"
            value={formData.bankAccount}
            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
          <textarea
            rows={2}
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="e.g. 30% advance for 2 x ULT freezers received in SBI Ambattur..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:bg-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={CreditCard}>
            Save Payment Receipt
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentFormModal;
