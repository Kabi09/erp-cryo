import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { Check, X, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import dayjs from 'dayjs';

export const POVerificationModal = ({
  isOpen,
  onClose,
  lead,
  customerPO,
  quotation,
  onSuccess,
}) => {
  const wonRev = quotation?.winningRevision || quotation?.activeRevision;
  const addToast = useToastStore((state) => state.addToast);
  const [submitting, setSubmitting] = useState(false);

  // Expected values from quotation
  const expectedItemSpec = wonRev?.items?.map((it) => `${it.productName}: ${it.specification || 'Standard Spec'}`).join('; ') || 'Standard Cryo Equipment Spec';
  const expectedQty = `${wonRev?.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1} Nos`;
  const expectedPriceValue = `Grand Total: Rs. ${Number(wonRev?.grandTotal || 0).toLocaleString('en-IN')} (Taxable: Rs. ${Number(wonRev?.taxableAmount || 0).toLocaleString('en-IN')} + 18% GST)`;
  const expectedDeliveryDate = wonRev?.deliveryPeriod || '4 to 6 Weeks from PO acceptance';
  const expectedPaymentTerms = wonRev?.paymentTerms || '30% Advance with PO, 70% against PI before dispatch';

  // Actual values from PO
  const actualItemSpec = customerPO?.itemSummary || 'Item description from PO';
  const actualQty = `${customerPO?.quantity || 1} Nos`;
  const actualPriceValue = `PO Value: Rs. ${Number(customerPO?.poValue || 0).toLocaleString('en-IN')}`;
  const actualDeliveryDate = customerPO?.deliveryDate
    ? `${dayjs(customerPO.deliveryDate).format('DD MMM YYYY')} (${customerPO.deliveryPeriodText || 'Lead time'})`
    : 'Lead time as specified in PO';
  const actualPaymentTerms = customerPO?.paymentTerms || 'Payment terms from PO';

  // Verification state for 5 points
  const [point1, setPoint1] = useState({
    status: 'MATCH',
    remarks: 'Equipment name, model, and technical specifications match quotation.',
  });
  const [point2, setPoint2] = useState({
    status: 'MATCH',
    remarks: 'Quantity matches quotation line items.',
  });
  const [point3, setPoint3] = useState({
    status: Number(wonRev?.grandTotal) === Number(customerPO?.poValue) ? 'MATCH' : 'MISMATCH',
    remarks: Number(wonRev?.grandTotal) === Number(customerPO?.poValue) ? 'Total commercial PO value matches approved quote.' : 'Value mismatch between quote and PO.',
  });
  const [point4, setPoint4] = useState({
    status: 'MATCH',
    remarks: 'Delivery schedule acceptable to manufacturing team.',
  });
  const [point5, setPoint5] = useState({
    status: 'MATCH',
    remarks: 'Payment terms adhere to Cryo Scientific commercial policy.',
  });

  const [generalRemarks, setGeneralRemarks] = useState('');

  // Auto detect mismatches on initial open
  useEffect(() => {
    if (isOpen && wonRev && customerPO) {
      const quoteQty = wonRev?.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1;
      const poQty = customerPO.quantity || 1;
      const qtyMatches = Number(quoteQty) === Number(poQty);
      setPoint2({
        status: qtyMatches ? 'MATCH' : 'MISMATCH',
        remarks: qtyMatches
          ? 'Quantity matches quotation line items.'
          : `PO Quantity (${poQty}) does not match Quotation Quantity (${quoteQty}).`,
      });

      const priceMatches = Math.abs(Number(wonRev.grandTotal) - Number(customerPO.poValue)) < 1;
      setPoint3({
        status: priceMatches ? 'MATCH' : 'MISMATCH',
        remarks: priceMatches
          ? 'Pricing matches approved quotation.'
          : `PO Total (Rs. ${Number(customerPO.poValue).toLocaleString('en-IN')}) does not match Quotation Grand Total (Rs. ${Number(wonRev.grandTotal).toLocaleString('en-IN')}).`,
      });
    }
  }, [isOpen, wonRev, customerPO]);

  const allPointsMatch =
    point1.status === 'MATCH' &&
    point2.status === 'MATCH' &&
    point3.status === 'MATCH' &&
    point4.status === 'MATCH' &&
    point5.status === 'MATCH';

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const payload = {
        leadId: lead._id,
        customerPOId: customerPO._id,
        quotationId: quotation?._id || customerPO.quotation,
        checks: {
          itemSpecification: {
            expectedValue: expectedItemSpec,
            actualValue: actualItemSpec,
            status: point1.status,
            remarks: point1.remarks,
          },
          quantity: {
            expectedValue: expectedQty,
            actualValue: actualQty,
            status: point2.status,
            remarks: point2.remarks,
          },
          pricingValue: {
            expectedValue: expectedPriceValue,
            actualValue: actualPriceValue,
            status: point3.status,
            remarks: point3.remarks,
          },
          deliveryDate: {
            expectedValue: expectedDeliveryDate,
            actualValue: actualDeliveryDate,
            status: point4.status,
            remarks: point4.remarks,
          },
          paymentTerms: {
            expectedValue: expectedPaymentTerms,
            actualValue: actualPaymentTerms,
            status: point5.status,
            remarks: point5.remarks,
          },
        },
        generalRemarks,
      };

      const res = await api.post('/verifications', payload);

      if (allPointsMatch) {
        addToast({
          type: 'success',
          title: 'Verification Passed',
          message: 'All 5 points match! Sales Order creation is now officially unlocked.',
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Verification Mismatch Detected',
          message: 'Sales Order blocked. Please request PO Amendment from customer.',
        });
      }

      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Verification Failed',
        message: err.response?.data?.message || 'Failed to record verification',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mandatory Five-Point Customer PO Verification"
      subtitle={`Verifying Customer PO: ${customerPO?.poNumber || ''} against Approved Quotation ${quotation?.quotationNumber || ''}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Compliance Notice Banner */}
        {allPointsMatch ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold">All 5 Verification Points Currently MATCH</span>
                <p className="text-emerald-800 text-[11px]">
                  Submitting this verification will authorize and unlock immediate Sales Order creation.
                </p>
              </div>
            </div>
            <Badge variant="success" size="lg">Ready for SO</Badge>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-300 rounded-xl p-3.5 flex items-center justify-between text-xs text-red-950">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <span className="font-bold">CRITICAL ENFORCEMENT: Mismatch Detected</span>
                <p className="text-red-800 text-[11px]">
                  Cryo Scientific rules strictly prohibit Sales Order generation with mismatches. A PO Amendment will be required.
                </p>
              </div>
            </div>
            <Badge variant="danger" size="lg">SO Blocked</Badge>
          </div>
        )}

        {/* 5-Point Verification Interactive Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5 w-12 text-center">#</th>
                <th className="py-3 px-3.5 w-44">Verification Parameter</th>
                <th className="py-3 px-3.5">Approved Quotation (Expected)</th>
                <th className="py-3 px-3.5">Customer PO (Actual)</th>
                <th className="py-3 px-3.5 w-36 text-center">Status</th>
                <th className="py-3 px-3.5 w-52">Verification Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {/* Point 1: Product / Spec */}
              <tr className={point1.status === 'MISMATCH' ? 'bg-red-50/40' : ''}>
                <td className="p-3 text-center font-bold text-slate-500">1</td>
                <td className="p-3 font-semibold text-slate-900">
                  Item / Product Name & Specifications
                </td>
                <td className="p-3 text-slate-600 text-[11px] leading-relaxed">
                  {expectedItemSpec}
                </td>
                <td className="p-3 font-medium text-slate-900 text-[11px] leading-relaxed">
                  {actualItemSpec}
                </td>
                <td className="p-3 text-center">
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setPoint1({ ...point1, status: 'MATCH' })}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                        point1.status === 'MATCH'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MATCH
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoint1({ ...point1, status: 'MISMATCH' })}
                      className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
                        point1.status === 'MISMATCH'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MISMATCH
                    </button>
                  </div>
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={point1.remarks}
                    onChange={(e) => setPoint1({ ...point1, remarks: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 focus:ring-1 focus:ring-sky-500"
                    placeholder="Remarks..."
                  />
                </td>
              </tr>

              {/* Point 2: Quantity */}
              <tr className={point2.status === 'MISMATCH' ? 'bg-red-50/40' : ''}>
                <td className="p-3 text-center font-bold text-slate-500">2</td>
                <td className="p-3 font-semibold text-slate-900">Quantity</td>
                <td className="p-3 text-slate-600 text-[11px] font-medium">{expectedQty}</td>
                <td className="p-3 font-bold text-slate-900 text-[11px]">{actualQty}</td>
                <td className="p-3 text-center">
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setPoint2({ ...point2, status: 'MATCH' })}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                        point2.status === 'MATCH'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MATCH
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoint2({ ...point2, status: 'MISMATCH' })}
                      className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
                        point2.status === 'MISMATCH'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MISMATCH
                    </button>
                  </div>
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={point2.remarks}
                    onChange={(e) => setPoint2({ ...point2, remarks: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 focus:ring-1 focus:ring-sky-500"
                    placeholder="Remarks..."
                  />
                </td>
              </tr>

              {/* Point 3: Pricing & Total Value */}
              <tr className={point3.status === 'MISMATCH' ? 'bg-red-50/40' : ''}>
                <td className="p-3 text-center font-bold text-slate-500">3</td>
                <td className="p-3 font-semibold text-slate-900">
                  Unit Price & Total Value
                </td>
                <td className="p-3 text-slate-600 text-[11px] font-medium">
                  {expectedPriceValue}
                </td>
                <td className="p-3 font-bold text-slate-900 text-[11px]">
                  {actualPriceValue}
                </td>
                <td className="p-3 text-center">
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setPoint3({ ...point3, status: 'MATCH' })}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                        point3.status === 'MATCH'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MATCH
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoint3({ ...point3, status: 'MISMATCH' })}
                      className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
                        point3.status === 'MISMATCH'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MISMATCH
                    </button>
                  </div>
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={point3.remarks}
                    onChange={(e) => setPoint3({ ...point3, remarks: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 focus:ring-1 focus:ring-sky-500"
                    placeholder="Remarks..."
                  />
                </td>
              </tr>

              {/* Point 4: Delivery Date */}
              <tr className={point4.status === 'MISMATCH' ? 'bg-red-50/40' : ''}>
                <td className="p-3 text-center font-bold text-slate-500">4</td>
                <td className="p-3 font-semibold text-slate-900">Delivery Date</td>
                <td className="p-3 text-slate-600 text-[11px] font-medium">
                  {expectedDeliveryDate}
                </td>
                <td className="p-3 font-bold text-slate-900 text-[11px]">
                  {actualDeliveryDate}
                </td>
                <td className="p-3 text-center">
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setPoint4({ ...point4, status: 'MATCH' })}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                        point4.status === 'MATCH'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MATCH
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoint4({ ...point4, status: 'MISMATCH' })}
                      className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
                        point4.status === 'MISMATCH'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MISMATCH
                    </button>
                  </div>
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={point4.remarks}
                    onChange={(e) => setPoint4({ ...point4, remarks: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 focus:ring-1 focus:ring-sky-500"
                    placeholder="Remarks..."
                  />
                </td>
              </tr>

              {/* Point 5: Payment Terms */}
              <tr className={point5.status === 'MISMATCH' ? 'bg-red-50/40' : ''}>
                <td className="p-3 text-center font-bold text-slate-500">5</td>
                <td className="p-3 font-semibold text-slate-900">Payment Terms</td>
                <td className="p-3 text-slate-600 text-[11px] font-medium">
                  {expectedPaymentTerms}
                </td>
                <td className="p-3 font-bold text-slate-900 text-[11px]">
                  {actualPaymentTerms}
                </td>
                <td className="p-3 text-center">
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setPoint5({ ...point5, status: 'MATCH' })}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                        point5.status === 'MATCH'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MATCH
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoint5({ ...point5, status: 'MISMATCH' })}
                      className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
                        point5.status === 'MISMATCH'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MISMATCH
                    </button>
                  </div>
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={point5.remarks}
                    onChange={(e) => setPoint5({ ...point5, remarks: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 focus:ring-1 focus:ring-sky-500"
                    placeholder="Remarks..."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Overall Commercial Sign-off Remarks
          </label>
          <textarea
            rows="2"
            className="block w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
            placeholder="Record overall verification conclusion..."
            value={generalRemarks}
            onChange={(e) => setGeneralRemarks(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={allPointsMatch ? 'success' : 'danger'}
            loading={submitting}
          >
            {allPointsMatch ? 'Complete Verification (All 5 Match)' : 'Record Verification (Contains Mismatch)'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

