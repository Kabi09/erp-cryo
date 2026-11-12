import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { Upload, FileCheck, FileText, AlertCircle } from 'lucide-react';

export const CustomerPOModal = ({ isOpen, onClose, lead, quotation, pi, onUpdated }) => {
  const winningRev = quotation?.winningRevision || quotation?.activeRevision;

  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [poValue, setPoValue] = useState(winningRev?.grandTotal || '');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [deliveryPeriodText, setDeliveryPeriodText] = useState(winningRev?.deliveryPeriod || '4-6 Weeks');
  const [paymentTerms, setPaymentTerms] = useState(winningRev?.paymentTerms || '30% Advance, 70% against PI before dispatch');
  const [itemSummary, setItemSummary] = useState(
    winningRev?.items?.map((it) => `${it.productName} (Qty: ${it.quantity})`).join(', ') || ''
  );
  const [quantity, setQuantity] = useState(winningRev?.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!poNumber || !poDate || !poValue || !itemSummary) {
      addToast({
        type: 'warning',
        title: 'Validation',
        message: 'Please fill in PO Number, PO Date, PO Value, and Item Summary',
      });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('leadId', lead._id);
      formData.append('customerId', lead.customer?._id || lead.customer);
      formData.append('quotationId', quotation?._id || lead.currentQuotation?._id || lead.currentQuotation);
      if (pi?._id) formData.append('proformaInvoiceId', pi._id);

      formData.append('poNumber', poNumber);
      formData.append('poDate', poDate);
      formData.append('poValue', Number(poValue));
      formData.append('deliveryDate', deliveryDate);
      formData.append('deliveryPeriodText', deliveryPeriodText);
      formData.append('paymentTerms', paymentTerms);
      formData.append('itemSummary', itemSummary);
      formData.append('quantity', Number(quantity));
      formData.append('notes', notes);

      if (file) {
        formData.append('poDocument', file);
      }

      const res = await api.post('/purchase-orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      addToast({
        type: 'success',
        title: 'Customer PO Uploaded',
        message: `PO ${poNumber} recorded successfully! Ready for 5-Point Verification.`,
      });

      onUpdated();
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.response?.data?.message || 'Failed to record customer PO',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Purchase Order (PO) Upload & Entry"
      subtitle="Stage 9: Log received customer purchase order before mandatory five-point verification"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-950">
          <FileCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Crucial Next Step: Five-Point PO Verification</span>
            <p className="mt-0.5 text-sky-900 leading-relaxed">
              Ensure accurate entry of PO number, values, and terms. Before a Sales Order can be generated, every point will be verified against the approved Quotation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Customer PO Number"
            required
            placeholder="e.g. PO/IITM/2026/990"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
          />

          <Input
            label="Customer PO Date"
            type="date"
            required
            value={poDate}
            onChange={(e) => setPoDate(e.target.value)}
          />

          <Input
            label="PO Total Value (INR incl. taxes)"
            type="number"
            required
            value={poValue}
            onChange={(e) => setPoValue(e.target.value)}
          />

          <Input
            label="Committed Delivery Date on PO"
            type="date"
            required
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />

          <Input
            label="Total Quantity on PO"
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <Input
            label="Delivery Lead Time Clause"
            placeholder="e.g. 4 Weeks from PO acceptance"
            value={deliveryPeriodText}
            onChange={(e) => setDeliveryPeriodText(e.target.value)}
          />

          <div className="sm:col-span-2">
            <Input
              label="Item Description & Specifications as printed on Customer PO"
              required
              value={itemSummary}
              onChange={(e) => setItemSummary(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Payment Terms as specified in Customer PO"
              required
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>
        </div>

        {/* File Upload Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Upload Customer PO Document (PDF, JPG, PNG)
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-sky-500 transition bg-slate-50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              id="poFile"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
            />
            <label
              htmlFor="poFile"
              className="cursor-pointer text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              {file ? file.name : 'Click to choose Customer PO file or drag & drop'}
            </label>
            <p className="text-[10px] text-slate-400 mt-1">Maximum file size: 10 MB (PDF preferred)</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Internal Notes / Discrepancy Warnings
          </label>
          <textarea
            rows="2"
            className="block w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
            placeholder="Note any remarks before initiating verification..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={Upload}>
            Record PO & Proceed to Verification
          </Button>
        </div>
      </form>
    </Modal>
  );
};

