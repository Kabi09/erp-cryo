import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { CheckSquare, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';

const POVerificationModal = ({ isOpen, onClose, customerPO, onVerified }) => {
  const [checks, setChecks] = useState({
    productModelMatch: true,
    quantityMatch: true,
    unitPriceMatch: true,
    totalValueMatch: true,
    gstRateMatch: true,
    deliveryPeriodMatch: true,
    paymentTermsMatch: true,
    technicalSpecsMatch: true,
    mismatchNotes: '',
    verificationStatus: 'Verified'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerPO) {
      const existing = customerPO.verificationChecks || {};
      setChecks({
        productModelMatch: existing.productModelMatch ?? true,
        quantityMatch: existing.quantityMatch ?? true,
        unitPriceMatch: existing.unitPriceMatch ?? true,
        totalValueMatch: existing.totalValueMatch ?? true,
        gstRateMatch: existing.gstRateMatch ?? true,
        deliveryPeriodMatch: existing.deliveryPeriodMatch ?? true,
        paymentTermsMatch: existing.paymentTermsMatch ?? true,
        technicalSpecsMatch: existing.technicalSpecsMatch ?? true,
        mismatchNotes: existing.mismatchNotes || '',
        verificationStatus: customerPO.verificationStatus === 'Pending' ? 'Verified' : customerPO.verificationStatus
      });
    }
  }, [customerPO, isOpen]);

  if (!customerPO) return null;

  const quoteTotal = customerPO.quotation?.grandTotal || 0;
  const poTotal = customerPO.poValue || 0;
  const isValueDifferent = Math.abs(quoteTotal - poTotal) > 1;

  const handleSubmit = async (status) => {
    setLoading(true);
    try {
      await api.patch(`/customer-pos/${customerPO._id}/verify`, {
        ...checks,
        verificationStatus: status
      });
      onVerified();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating PO verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`3-Way PO Reconciliation & Verification — ${customerPO.customerPoNumber}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5 text-xs">
        {/* 3-Way Comparison Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Accepted Quotation</span>
            <span className="font-bold text-slate-800">{customerPO.quotationNumber}</span>
            <span className="text-brand-900 font-extrabold block text-sm mt-1">₹{quoteTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Company Proforma Invoice</span>
            <span className="font-bold text-slate-800">{customerPO.piNumber || 'N/A'}</span>
            <span className="text-slate-700 font-extrabold block text-sm mt-1">
              {customerPO.proformaInvoice?.totalPiAmount ? `₹${customerPO.proformaInvoice.totalPiAmount.toLocaleString('en-IN')}` : 'Generated'}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${isValueDifferent ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-600 block">Received Customer PO</span>
            <span className="font-bold text-slate-900">{customerPO.customerPoNumber}</span>
            <span className={`font-extrabold block text-sm mt-1 ${isValueDifferent ? 'text-rose-700' : 'text-emerald-800'}`}>
              ₹{poTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {isValueDifferent && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              <b>Warning: Value Mismatch Detected!</b> Customer PO Value differs from Accepted Quote total by ₹{Math.abs(quoteTotal - poTotal).toLocaleString('en-IN')}.
            </span>
          </div>
        )}

        {/* 8 Verification Checklist Parameters */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] border-b border-slate-100 pb-1">
            Reconciliation Checklist
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'productModelMatch', label: '1. Product Model & Nomenclature matches Quote' },
              { id: 'quantityMatch', label: '2. Ordered Quantities match Quotation' },
              { id: 'unitPriceMatch', label: '3. Unit Selling Price matches agreed rate' },
              { id: 'totalValueMatch', label: '4. Commercial Grand Total matches PO total' },
              { id: 'gstRateMatch', label: '5. Applicable GST Rate (18%) confirmed' },
              { id: 'deliveryPeriodMatch', label: '6. Delivery Period SLA achievable' },
              { id: 'paymentTermsMatch', label: '7. Payment & Advance terms matched' },
              { id: 'technicalSpecsMatch', label: '8. Technical Specifications & accessories clear' }
            ].map(item => (
              <label key={item.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks[item.id]}
                  onChange={(e) => setChecks({ ...checks, [item.id]: e.target.checked })}
                  className="rounded text-brand-900 focus:ring-brand-500 w-4 h-4"
                />
                <span className="text-xs text-slate-700 font-medium">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Mismatch Details / Verification Auditor Notes</label>
          <textarea
            rows={2}
            value={checks.mismatchNotes}
            onChange={(e) => setChecks({ ...checks, mismatchNotes: e.target.value })}
            placeholder="Record any discrepancies or justification for approval..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
          />
        </div>

        {/* Verification Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              loading={loading}
              onClick={() => handleSubmit('Mismatch')}
            >
              Flag Mismatch / Clarification
            </Button>
            <Button
              variant="success"
              size="sm"
              icon={CheckCircle2}
              loading={loading}
              onClick={() => handleSubmit('Verified')}
            >
              Confirm 3-Way Verified
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default POVerificationModal;
