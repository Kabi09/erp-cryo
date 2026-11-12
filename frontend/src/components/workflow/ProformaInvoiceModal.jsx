import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { Receipt, Download, FileText, Check } from 'lucide-react';

export const ProformaInvoiceModal = ({ isOpen, onClose, quotation, lead, onUpdated }) => {
  const [validityDays, setValidityDays] = useState(30);
  const [notes, setNotes] = useState('Payment to be made by RTGS/NEFT to Cryo Scientific Systems SBI account.');
  const [submitting, setSubmitting] = useState(false);

  const addToast = useToastStore((state) => state.addToast);
  const winningRev = quotation?.winningRevision || quotation?.activeRevision;

  const handleGeneratePI = async (e) => {
    e.preventDefault();

    if (quotation?.status !== 'Won') {
      addToast({
        type: 'error',
        title: 'Action Blocked',
        message: 'Proforma Invoice can only be created after the Quotation is marked Won.',
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/proforma-invoices', {
        quotationId: quotation._id,
        validityDays: Number(validityDays),
        notes,
      });

      addToast({
        type: 'success',
        title: 'Proforma Invoice Issued',
        message: `PI ${res.data.data.piNumber} generated successfully!`,
      });

      onUpdated();
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: err.response?.data?.message || 'Failed to generate Proforma Invoice',
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
      title="Generate Proforma Invoice (PI)"
      subtitle="Stage 8: Commercial billing document issued against Won Quotation"
      size="md"
    >
      <form onSubmit={handleGeneratePI} className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Won Quotation:</span>
            <span className="font-semibold text-slate-900">{quotation?.quotationNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Approved Revision:</span>
            <span className="font-semibold text-slate-900">{winningRev?.revisionLabel || 'Rev 0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Customer Billed:</span>
            <span className="font-semibold text-slate-900">{lead?.companyName}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-sky-950">
            <span>PI Total Value:</span>
            <span className="text-emerald-700">{formatINR(winningRev?.grandTotal)}</span>
          </div>
        </div>

        <Input
          label="PI Validity (Days)"
          type="number"
          min="1"
          required
          value={validityDays}
          onChange={(e) => setValidityDays(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Remittance Notes & Bank Instructions
          </label>
          <textarea
            rows="3"
            className="block w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={Receipt}>
            Generate & Issue Proforma Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
};

