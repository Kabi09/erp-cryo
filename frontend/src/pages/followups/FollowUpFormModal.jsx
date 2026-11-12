import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import api from '../../services/api';

const followUpTypes = ['Call', 'Email', 'WhatsApp', 'Meeting', 'Direct Visit', 'Online Demo', 'Other'];
const customerResponses = [
  'Positive / High Interest',
  'Interested / Needs Time',
  'Price Negotiation Requested',
  'Technical Clarification Needed',
  'Budget Constraint',
  'Competitor Comparison',
  'Not Interested / Dropped',
  'Pending Decision'
];

const FollowUpFormModal = ({ isOpen, onClose, initialEnquiry, onSaved }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState('');
  const [staffUsers, setStaffUsers] = useState([]);

  const [formData, setFormData] = useState({
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '10:30 AM',
    followUpType: 'Call',
    discussionDetails: '',
    customerResponse: 'Positive / High Interest',
    requirementChanges: '',
    nextFollowUpDate: '',
    assignedTo: '',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/enquiries').then(res => {
        if (res.data.success) setEnquiries(res.data.data);
      });
      api.get('/auth/users').then(res => {
        if (res.data.success) setStaffUsers(res.data.data);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialEnquiry) {
      setSelectedEnquiryId(initialEnquiry._id);
      setFormData(prev => ({
        ...prev,
        assignedTo: initialEnquiry.assignedTo?._id || initialEnquiry.assignedTo || ''
      }));
    }
    setError('');
  }, [initialEnquiry, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnquiryId) {
      setError('Please select an enquiry');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/followups', {
        ...formData,
        enquiry: selectedEnquiryId
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording follow-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Customer Follow-up Interaction" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Target Customer Enquiry *</label>
          <select
            value={selectedEnquiryId}
            onChange={(e) => setSelectedEnquiryId(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:bg-white"
          >
            <option value="">-- Select Enquiry --</option>
            {enquiries.map((enq) => (
              <option key={enq._id} value={enq._id}>
                {enq.enquiryNumber} — {enq.companyName} ({enq.contactPerson})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Follow-up Date *</label>
            <input
              type="date"
              required
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Time</label>
            <input
              type="text"
              value={formData.followUpTime}
              onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value })}
              placeholder="11:00 AM"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Channel / Medium</label>
            <select
              value={formData.followUpType}
              onChange={(e) => setFormData({ ...formData, followUpType: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            >
              {followUpTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Customer Sentiment / Response</label>
          <select
            value={formData.customerResponse}
            onChange={(e) => setFormData({ ...formData, customerResponse: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
          >
            {customerResponses.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Discussion Details & Minutes *</label>
          <textarea
            rows={3}
            required
            value={formData.discussionDetails}
            onChange={(e) => setFormData({ ...formData, discussionDetails: e.target.value })}
            placeholder="Detailed discussion points, customer questions answered..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Scheduled Date</label>
            <input
              type="date"
              value={formData.nextFollowUpDate}
              onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assign Responsible Officer</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
            >
              <option value="">Select Employee...</option>
              {staffUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Follow-up Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FollowUpFormModal;
