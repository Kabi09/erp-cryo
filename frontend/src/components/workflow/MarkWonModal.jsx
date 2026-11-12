import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { Trophy, CheckCircle } from 'lucide-react';

export const MarkWonModal = ({ isOpen, onClose, quotation, onUpdated }) => {
  const [winningRevisionId, setWinningRevisionId] = useState('');
  const [remarks, setRemarks] = useState('Customer confirmed verbal/email order acceptance.');
  const [submitting, setSubmitting] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const revisions = quotation?.revisions || [];
  const currentActiveRevId = quotation?.activeRevision?._id || quotation?.activeRevision;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post(`/quotations/${quotation._id}/mark-won`, {
        winningRevisionId: winningRevisionId || currentActiveRevId,
        wonRemarks: remarks,
      });

      addToast({
        type: 'success',
        title: 'Deal Won!',
        message: 'Quotation marked as Won. Proforma Invoice (PI) can now be issued.',
      });

      onUpdated(res.data.data);
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed',
        message: err.response?.data?.message || 'Failed to mark quotation as won',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Quotation as Won"
      subtitle="Stage 7: Finalize commercial agreement and authorize Proforma Invoice issuance"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <Trophy className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950">
            <span className="font-bold">Deal Won Confirmation</span>
            <p className="mt-1 text-emerald-900 leading-relaxed">
              Marking this quotation as Won fixes the finalized revision terms. This is a mandatory prerequisite before Proforma Invoice (PI) and Sales Order (SO) generation.
            </p>
          </div>
        </div>

        <Select
          label="Winning Revision"
          required
          value={winningRevisionId || currentActiveRevId}
          onChange={(e) => setWinningRevisionId(e.target.value)}
        >
          {revisions.map((rev) => (
            <option key={rev._id} value={rev._id}>
              {rev.revisionLabel} — {formatINR(rev.grandTotal)} ({rev.revisionReason || 'Revision'})
            </option>
          ))}
        </Select>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Won Remarks / Order Confirmation Details <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="3"
            required
            className="block w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
            placeholder="Record customer purchase approval, PO number committed, or payment advance discussed..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success" loading={submitting} icon={CheckCircle}>
            Confirm Quotation Won
          </Button>
        </div>
      </form>
    </Modal>
  );
};

