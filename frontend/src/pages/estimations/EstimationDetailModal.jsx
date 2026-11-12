import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';
import api from '../../services/api';

const EstimationDetailModal = ({ isOpen, onClose, estimation, onReviewed }) => {
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  if (!estimation) return null;

  const handleReview = async (status) => {
    setLoading(true);
    try {
      await api.patch(`/estimations/${estimation._id}/review`, {
        status,
        reviewRemarks
      });
      onReviewed();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cost Estimation Dossier — ${estimation.estimateNumber} (Rev ${estimation.revisionNumber || 1})`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-xs">
        {/* Header Summary */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-brand-900">{estimation.customerName}</span>
              <Badge>{estimation.status}</Badge>
            </div>
            <p className="text-slate-500 mt-1">
              Enquiry: <span className="font-semibold text-slate-800">{estimation.enquiryNumber}</span> • Date: {new Date(estimation.estimateDate).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-slate-500 uppercase text-[10px] block">Grand Estimated Amount</span>
            <span className="text-xl font-bold text-brand-900">₹{(estimation.grandTotal || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Detailed BOM Cost breakdown */}
        <div className="space-y-4">
          {estimation.items?.map((item, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 flex justify-between">
                <span>{item.productName} ({item.modelNumber}) — Qty: {item.quantity}</span>
                <span className="text-brand-900 font-extrabold">Final: ₹{(item.finalEstimatedAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-4">Category</th>
                    <th className="py-2 px-4">Component Item</th>
                    <th className="py-2 px-4">Qty</th>
                    <th className="py-2 px-4">Unit Rate</th>
                    <th className="py-2 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {item.costingLines?.map((line, lIdx) => (
                    <tr key={lIdx}>
                      <td className="py-2 px-4 font-medium text-slate-600">{line.category}</td>
                      <td className="py-2 px-4 text-slate-800">{line.itemName}</td>
                      <td className="py-2 px-4">{line.quantity} {line.unit}</td>
                      <td className="py-2 px-4">₹{(line.unitPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right font-semibold">₹{(line.totalAmount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between font-semibold text-slate-700">
                <span>Item Total Cost: ₹{(item.totalEstimatedCost || 0).toLocaleString('en-IN')}</span>
                <span>Margin: {item.profitMarginPercent}% (₹{(item.profitAmount || 0).toLocaleString('en-IN')})</span>
                <span>Selling: ₹{(item.sellingPrice || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Review Remarks & Action */}
        {estimation.status === 'Pending Approval' ? (
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-800">Engineering Manager Approval Gate</h4>
            <textarea
              rows={2}
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              placeholder="Enter technical comments or approval remarks..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                loading={loading}
                onClick={() => handleReview('Rejected')}
              >
                Reject Costing
              </Button>
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                loading={loading}
                onClick={() => handleReview('Approved')}
              >
                Approve Costing
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-700 block">Review Decision:</span>
            <p className="text-slate-600 mt-0.5">{estimation.reviewRemarks || 'Approved as per baseline BOM.'}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EstimationDetailModal;
