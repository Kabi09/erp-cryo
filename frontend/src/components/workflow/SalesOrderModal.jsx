import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { PackageCheck, ShieldCheck, Check } from 'lucide-react';
import dayjs from 'dayjs';

export const SalesOrderModal = ({
  isOpen,
  onClose,
  lead,
  customerPO,
  latestVerification,
  onSuccess,
}) => {
  const [committedDispatchDate, setCommittedDispatchDate] = useState(
    customerPO?.deliveryDate
      ? new Date(customerPO.deliveryDate).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [deliverySchedule, setDeliverySchedule] = useState('4 Weeks from order acceptance');
  const [specialInstructions, setSpecialInstructions] = useState(
    'Factory vacuum and pressure test certificate required before packing.'
  );
  const [submitting, setSubmitting] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  // Check strict verification rule
  const isVerificationPassed =
    latestVerification &&
    latestVerification.allMatched === true &&
    latestVerification.overallStatus === 'PASSED';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerificationPassed) {
      addToast({
        type: 'error',
        title: 'Action Strictly Blocked',
        message: 'Sales Order CANNOT be created until all 5 PO Verification points match!',
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/sales-orders', {
        leadId: lead._id,
        customerPOId: customerPO._id,
        poVerificationId: latestVerification._id,
        committedDispatchDate,
        deliverySchedule,
        specialInstructions,
      });

      addToast({
        type: 'success',
        title: 'Sales Order Generated!',
        message: `SO ${res.data.data.soNumber} successfully created and linked!`,
      });

      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Creation Blocked',
        message: err.response?.data?.message || 'Failed to create Sales Order',
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
      title="Create Formal Sales Order (SO)"
      subtitle="Stage 11: Final commercial release document linked to Verified Customer PO"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isVerificationPassed ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">5-Point Verification Verified & Cleared</span>
              <p className="mt-0.5 text-emerald-900 leading-relaxed">
                Verification Round {latestVerification.verificationRound} passed with 5/5 matching criteria on{' '}
                {dayjs(latestVerification.verifiedAt).format('DD MMM YYYY')}. Sales Order issuance authorized.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-300 rounded-xl p-3.5 flex items-start gap-3 text-xs text-red-950">
            <div>
              <span className="font-bold">MANDATORY RULE ENFORCEMENT</span>
              <p className="mt-0.5 text-red-900 leading-relaxed">
                PO Verification has not passed. You cannot create a Sales Order while mismatches exist.
              </p>
            </div>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Customer:</span>
            <span className="font-semibold text-slate-900">{lead?.companyName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Customer PO:</span>
            <span className="font-semibold text-slate-900">{customerPO?.poNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Order Value:</span>
            <span className="font-bold text-sky-700">{formatINR(customerPO?.poValue)}</span>
          </div>
        </div>

        <Input
          label="Committed Dispatch Date"
          type="date"
          required
          value={committedDispatchDate}
          onChange={(e) => setCommittedDispatchDate(e.target.value)}
        />

        <Input
          label="Delivery Schedule Clause"
          required
          value={deliverySchedule}
          onChange={(e) => setDeliverySchedule(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Special Manufacturing & Testing Instructions
          </label>
          <textarea
            rows="3"
            className="block w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isVerificationPassed}
            loading={submitting}
            icon={PackageCheck}
          >
            Generate Sales Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};

