import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import api from '../../services/api';

const NegotiationFormModal = ({ isOpen, onClose, quotation, onSaved }) => {
  const [customerResponse, setCustomerResponse] = useState('Accepted');
  const [customerRemarks, setCustomerRemarks] = useState('');
  const [requestedDiscountPercent, setRequestedDiscountPercent] = useState(0);
  const [revisedTargetPrice, setRevisedTargetPrice] = useState(0);
  const [technicalChanges, setTechnicalChanges] = useState('');
  const [deliveryChanges, setDeliveryChanges] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (quotation) {
      setRevisedTargetPrice(quotation.grandTotal || 0);
      setCustomerRemarks('');
      setCustomerResponse('Accepted');
    }
    setError('');
  }, [quotation, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quotation) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/negotiations', {
        quotation: quotation._id,
        customerResponse,
        customerRemarks,
        requestedDiscountPercent: Number(requestedDiscountPercent) || 0,
        revisedTargetPrice: Number(revisedTargetPrice) || 0,
        technicalChanges,
        deliveryChanges
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording customer response');
    } finally {
      setLoading(false);
    }
  };

  if (!quotation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customer Response & Negotiation — ${quotation.quotationNumber} (${quotation.versionLabel})`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium">
            {error}
          </div>
        )}

        {/* Current Quotation Info */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-800">{quotation.customerName}</span>
            <span className="text-[11px] text-slate-500 block">Current Quote Total: ₹{(quotation.grandTotal || 0).toLocaleString('en-IN')}</span>
          </div>
          <span className="font-mono text-brand-900 font-bold">{quotation.versionLabel}</span>
        </div>

        {/* Customer Decision Choice */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Customer Formal Response *</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Accepted', label: 'Accepted (Win)', color: 'bg-emerald-600' },
              { id: 'Negotiation', label: 'Counter-Offer', color: 'bg-amber-600' },
              { id: 'Rejected', label: 'Rejected (Lost)', color: 'bg-rose-600' }
            ].map((choice) => (
              <button
                type="button"
                key={choice.id}
                onClick={() => setCustomerResponse(choice.id)}
                className={`py-2 px-3 rounded-lg border font-semibold text-center transition-all ${
                  customerResponse === choice.id
                    ? `${choice.color} text-white border-transparent shadow-xs`
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>

        {customerResponse === 'Negotiation' && (
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-3">
            <h4 className="font-bold text-amber-900">Counter-Offer & Requested Concessions</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Requested Discount (%)</label>
                <input
                  type="number"
                  value={requestedDiscountPercent}
                  onChange={(e) => setRequestedDiscountPercent(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Customer Target Price (INR)</label>
                <input
                  type="number"
                  value={revisedTargetPrice}
                  onChange={(e) => setRevisedTargetPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">Technical or Scope Modifications Requested</label>
              <input
                type="text"
                value={technicalChanges}
                onChange={(e) => setTechnicalChanges(e.target.value)}
                placeholder="e.g. Include extra PT-100 calibration probe"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Customer Comments / Formal Communication *</label>
          <textarea
            rows={3}
            required
            value={customerRemarks}
            onChange={(e) => setCustomerRemarks(e.target.value)}
            placeholder="Official comments from client purchase committee / email response..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Response
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NegotiationFormModal;
