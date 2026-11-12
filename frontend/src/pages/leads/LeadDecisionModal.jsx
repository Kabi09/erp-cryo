import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import api from '../../services/api';

const lossReasons = [
  'Price Too High',
  'Competitor Selected',
  'Technical Issues',
  'Budget Not Available',
  'Project Cancelled',
  'Delivery Delay',
  'Customer Not Responding',
  'Specifications Mismatch',
  'Other'
];

const winReasons = [
  'Competitive Pricing Won',
  'Technical Superiority Won',
  'Existing Customer Relationship',
  'Compliance & DGHS Standards Met',
  'Fast Delivery Commitment',
  'Other'
];

const LeadDecisionModal = ({ isOpen, onClose, initialEnquiry, onSaved }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState('');

  const [leadStatus, setLeadStatus] = useState('Won');
  const [reason, setReason] = useState('Technical Superiority Won');
  const [expectedOrderValue, setExpectedOrderValue] = useState(0);
  const [remarks, setRemarks] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/enquiries').then(res => {
        if (res.data.success) setEnquiries(res.data.data);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialEnquiry) {
      setSelectedEnquiryId(initialEnquiry._id);
      const budget = initialEnquiry.products?.reduce((acc, p) => acc + (p.expectedBudget || 0), 0) || 500000;
      setExpectedOrderValue(budget);
    }
    setError('');
  }, [initialEnquiry, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnquiryId) {
      setError('Please choose an enquiry');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/leads', {
        enquiry: selectedEnquiryId,
        leadStatus,
        reason,
        expectedOrderValue: Number(expectedOrderValue) || 0,
        remarks
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating lead decision');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Lead Decision (Won / Lost / Hold)" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Target Enquiry *</label>
          <select
            value={selectedEnquiryId}
            onChange={(e) => setSelectedEnquiryId(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:bg-white"
          >
            <option value="">-- Choose Enquiry --</option>
            {enquiries.map((enq) => (
              <option key={enq._id} value={enq._id}>
                {enq.enquiryNumber} — {enq.companyName} ({enq.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Lead Outcome Status *</label>
          <div className="grid grid-cols-3 gap-2">
            {['Won', 'Lost', 'On Hold'].map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => {
                  setLeadStatus(status);
                  setReason(status === 'Won' ? winReasons[0] : status === 'Lost' ? lossReasons[0] : 'None');
                }}
                className={`py-2 px-3 rounded-lg border font-semibold transition-all ${
                  leadStatus === status
                    ? status === 'Won'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : status === 'Lost'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Primary Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
          >
            {leadStatus === 'Won' && winReasons.map(r => <option key={r} value={r}>{r}</option>)}
            {leadStatus === 'Lost' && lossReasons.map(r => <option key={r} value={r}>{r}</option>)}
            {leadStatus === 'On Hold' && <option value="None">None / Pending Decision</option>}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Expected / Agreed Deal Value (INR)</label>
          <input
            type="number"
            value={expectedOrderValue}
            onChange={(e) => setExpectedOrderValue(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Decision Remarks / Notes</label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add context on customer decision, competitor feedback..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:bg-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Lead Decision
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeadDecisionModal;
