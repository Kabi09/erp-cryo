import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Receipt } from 'lucide-react';
import api from '../../services/api';

const PIFormModal = ({ isOpen, onClose, onSaved }) => {
  const [acceptedQuotes, setAcceptedQuotes] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [advancePercentage, setAdvancePercentage] = useState(30);
  const [validityDays, setValidityDays] = useState(30);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/quotations?status=Accepted').then(res => {
        if (res.data.success) setAcceptedQuotes(res.data.data);
      });
    }
  }, [isOpen]);

  const handleQuoteChange = (qId) => {
    setSelectedQuoteId(qId);
    const q = acceptedQuotes.find(item => item._id === qId);
    setSelectedQuote(q || null);
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
      await api.post('/proforma-invoices', {
        quotation: selectedQuoteId,
        advancePercentage: Number(advancePercentage) || 30,
        validityDays: Number(validityDays) || 30
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating Proforma Invoice');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = selectedQuote?.grandTotal || 0;
  const advanceAmount = (totalValue * (Number(advancePercentage) || 30)) / 100;
  const balanceAmount = totalValue - advanceAmount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Proforma Invoice (PI)" maxWidth="max-w-xl">
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
            {acceptedQuotes.map(q => (
              <option key={q._id} value={q._id}>
                {q.quotationNumber} ({q.versionLabel}) — {q.customerName} (₹{(q.grandTotal || 0).toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        {selectedQuote && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">{selectedQuote.customerName}</span>
              <span className="font-bold text-brand-900 text-sm">₹{totalValue.toLocaleString('en-IN')}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Advance Percentage (%)</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={advancePercentage}
                  onChange={(e) => setAdvancePercentage(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-semibold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Validity (Days)</label>
                <input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
            </div>

            {/* Split Preview */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 text-slate-700">
              <div className="flex justify-between font-medium">
                <span>Advance Required ({advancePercentage}%):</span>
                <span className="font-bold text-emerald-700">₹{advanceAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Balance Payable ({100 - advancePercentage}%):</span>
                <span className="font-bold text-slate-800">₹{balanceAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Receipt}>
            Generate PI & PDF
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PIFormModal;
