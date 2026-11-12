import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { MessageSquareText } from 'lucide-react';

export const CustomerFeedbackModal = ({ isOpen, onClose, quotation, onUpdated }) => {
  const [feedbackType, setFeedbackType] = useState('Price High');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      addToast({ type: 'warning', title: 'Notes Required', message: 'Please provide customer feedback details' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/quotations/${quotation._id}/feedback`, {
        feedbackType,
        notes,
      });

      addToast({
        type: 'success',
        title: 'Feedback Logged',
        message: 'Customer review notes recorded on quotation timeline',
      });

      onUpdated(res.data.data);
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed',
        message: err.response?.data?.message || 'Failed to record feedback',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Review & Negotiation Feedback"
      subtitle={`Quotation Reference: ${quotation?.quotationNumber || ''}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Feedback Category"
          value={feedbackType}
          onChange={(e) => setFeedbackType(e.target.value)}
        >
          <option value="Price High">Price High - Counter-offer or discount requested</option>
          <option value="Delivery Lead Time Long">Delivery Lead Time Long - Urgent dispatch needed</option>
          <option value="Specs Clarification">Specs Clarification - Additional sensor or canister needed</option>
          <option value="Approved In Principle">Approved In Principle - Waiting for formal purchase release</option>
          <option value="Budget Constraints">Budget Constraints - Deferring or modifying size</option>
          <option value="Other">Other General Notes</option>
        </Select>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Detailed Customer Discussion Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="4"
            required
            className="block w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
            placeholder="Record customer points, requested revisions, commercial concessions discussed, or delivery compromises..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={MessageSquareText}>
            Save Review Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
};

