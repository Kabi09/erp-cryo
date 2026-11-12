import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { Factory, CheckCircle2 } from 'lucide-react';

export const ProductionHandoverModal = ({ isOpen, onClose, salesOrder, onUpdated }) => {
  const [targetCompletionDate, setTargetCompletionDate] = useState('');
  const [remarks, setRemarks] = useState(
    'Commercial, technical, and advance payment terms verified. Clear for manufacturing and shop-floor release.'
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (salesOrder) {
      setTargetCompletionDate(
        salesOrder.committedDispatchDate
          ? new Date(salesOrder.committedDispatchDate).toISOString().split('T')[0]
          : new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0]
      );
      setRemarks(
        'Commercial, technical, and advance payment terms verified. Clear for manufacturing and shop-floor release.'
      );
    }
  }, [salesOrder, isOpen]);

  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const res = await api.put(`/sales-orders/${salesOrder._id}/handover`, {
        handoverRemarks: remarks,
        targetCompletionDate,
      });

      addToast({
        type: 'success',
        title: 'Production Handover Completed',
        message: `Sales Order ${salesOrder.soNumber} successfully handed over to Production department!`,
      });

      onUpdated(res.data.data);
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Handover Failed',
        message: err.response?.data?.message || 'Failed to complete production handover',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Production Handover Sign-Off"
      subtitle={`Stage 12: Formal commercial release of Sales Order ${salesOrder?.soNumber || ''}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-950">
          <Factory className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Final Sales Workflow Milestone</span>
            <p className="mt-0.5 text-emerald-900 leading-relaxed">
              Completing this handover transitions the sales lifecycle to closed status and logs the formal commercial sign-off timestamp and Sales Admin credentials.
            </p>
          </div>
        </div>

        <Input
          label="Target Shop-Floor Completion Date"
          type="date"
          required
          value={targetCompletionDate}
          onChange={(e) => setTargetCompletionDate(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Handover Remarks & Manufacturing Instructions <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="3"
            required
            className="block w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success" loading={submitting} icon={CheckCircle2}>
            Confirm Production Handover
          </Button>
        </div>
      </form>
    </Modal>
  );
};

