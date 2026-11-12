import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { Edit3, Upload, AlertCircle } from 'lucide-react';

export const POAmendmentModal = ({ isOpen, onClose, customerPO, onUpdated }) => {
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [poValue, setPoValue] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [itemSummary, setItemSummary] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reasonForAmendment, setReasonForAmendment] = useState(
    'Correction of payment terms & commercial value as per approved quotation'
  );
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (customerPO) {
      setPoNumber(customerPO.poNumber || '');
      setPoDate(
        customerPO.poDate ? new Date(customerPO.poDate).toISOString().split('T')[0] : ''
      );
      setPoValue(customerPO.poValue || '');
      setDeliveryDate(
        customerPO.deliveryDate ? new Date(customerPO.deliveryDate).toISOString().split('T')[0] : ''
      );
      setPaymentTerms(customerPO.paymentTerms || '');
      setItemSummary(customerPO.itemSummary || '');
      setQuantity(customerPO.quantity || 1);
      setReasonForAmendment(
        'Correction of payment terms & commercial value as per approved quotation'
      );
      setFile(null);
    }
  }, [customerPO, isOpen]);

  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reasonForAmendment.trim()) {
      addToast({
        type: 'warning',
        title: 'Reason Required',
        message: 'Please provide the reason for amending this purchase order',
      });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('poNumber', poNumber);
      formData.append('poDate', poDate);
      formData.append('poValue', Number(poValue));
      formData.append('deliveryDate', deliveryDate);
      formData.append('paymentTerms', paymentTerms);
      formData.append('itemSummary', itemSummary);
      formData.append('quantity', Number(quantity));
      formData.append('reasonForAmendment', reasonForAmendment);

      if (file) {
        formData.append('poDocument', file);
      }

      const res = await api.post(`/purchase-orders/${customerPO._id}/amendment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      addToast({
        type: 'success',
        title: 'PO Amendment Submitted',
        message: res.data.message,
      });

      onUpdated();
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Amendment Failed',
        message: err.response?.data?.message || 'Failed to submit amendment',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Submit Customer PO Amendment (Current: v${customerPO?.amendmentVersion || 1})`}
      subtitle="Rectify verification mismatches and preserve amendment history"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-950">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Amendment Will Increment PO Version to v{(customerPO?.amendmentVersion || 1) + 1}</span>
            <p className="mt-0.5 text-amber-900 leading-relaxed">
              The existing PO document and details will be saved to the permanent audit history. The new amended PO will reset verification status to "Unverified" for re-checking.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Reason for Amendment <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Customer issued revised PO with corrected 30% advance payment terms"
            value={reasonForAmendment}
            onChange={(e) => setReasonForAmendment(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Amended PO Number"
            required
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
          />

          <Input
            label="Amended PO Date"
            type="date"
            required
            value={poDate}
            onChange={(e) => setPoDate(e.target.value)}
          />

          <Input
            label="Amended Total Value (INR)"
            type="number"
            required
            value={poValue}
            onChange={(e) => setPoValue(e.target.value)}
          />

          <Input
            label="Amended Delivery Date"
            type="date"
            required
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />

          <Input
            label="Quantity"
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <div className="sm:col-span-2">
            <Input
              label="Amended Item Description"
              required
              value={itemSummary}
              onChange={(e) => setItemSummary(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Amended Payment Terms"
              required
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Upload Amended Customer PO Document (Optional if newly received)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className="block w-full text-xs text-slate-600 border border-slate-200 rounded-lg p-2"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={Edit3}>
            Submit Amended PO
          </Button>
        </div>
      </form>
    </Modal>
  );
};

