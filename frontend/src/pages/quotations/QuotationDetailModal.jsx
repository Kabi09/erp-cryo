import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Download, Send, CheckCircle2, RotateCcw, MessageSquare, FileText } from 'lucide-react';
import api from '../../services/api';

const QuotationDetailModal = ({ isOpen, onClose, quotation, onActionCompleted, onRevise, onNegotiate }) => {
  const [loading, setLoading] = useState(false);

  if (!quotation) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.patch(`/quotations/${quotation._id}/approve`);
      onActionCompleted();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSent = async () => {
    setLoading(true);
    try {
      await api.patch(`/quotations/${quotation._id}/send`, { sentChannel: 'Email' });
      onActionCompleted();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`/api/quotations/${quotation._id}/pdf`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quotation Dossier — ${quotation.quotationNumber} (${quotation.versionLabel})`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-xs">
        {/* Top Header Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-brand-900">{quotation.customerName}</span>
              <Badge>{quotation.status}</Badge>
              <span className="text-[10px] font-bold bg-brand-100 text-brand-900 px-2 py-0.5 rounded">
                Version {quotation.versionLabel}
              </span>
            </div>
            <p className="text-slate-500 mt-1">
              Enquiry: <span className="font-semibold text-slate-800">{quotation.enquiryNumber}</span> • Issued: {new Date(quotation.quotationDate).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" icon={Download} onClick={handleDownloadPdf}>
              Download PDF
            </Button>

            {quotation.status === 'Pending Approval' && (
              <Button size="sm" variant="success" icon={CheckCircle2} loading={loading} onClick={handleApprove}>
                Approve Quotation
              </Button>
            )}

            {quotation.status === 'Approved' && (
              <Button size="sm" variant="primary" icon={Send} loading={loading} onClick={handleMarkSent}>
                Mark Sent to Customer
              </Button>
            )}

            {(quotation.status === 'Sent' || quotation.status === 'Under Negotiation') && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={RotateCcw}
                  onClick={() => {
                    onClose();
                    onRevise(quotation);
                  }}
                >
                  Create Revised V{quotation.version + 1}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={MessageSquare}
                  onClick={() => {
                    onClose();
                    onNegotiate(quotation);
                  }}
                >
                  Customer Response / Accept
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Equipment & Description</th>
                <th className="py-2.5 px-4">Qty</th>
                <th className="py-2.5 px-4">Unit Rate</th>
                <th className="py-2.5 px-4">GST</th>
                <th className="py-2.5 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotation.products?.map((p, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-semibold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block">{p.productName} ({p.model || 'Standard'})</span>
                    <span className="text-[11px] text-slate-500">{p.technicalSpecifications}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{p.quantity} {p.unit || 'Nos'}</td>
                  <td className="py-3 px-4">₹{(p.unitPrice || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-slate-600">{p.gstPercent || 18}%</td>
                  <td className="py-3 px-4 text-right font-bold text-brand-900">₹{(p.lineTotal || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Totals Box */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <div className="w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{(quotation.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total GST (18%):</span>
                <span className="font-semibold">₹{(quotation.gstTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-brand-900 border-t border-slate-200 pt-1.5">
                <span>Grand Total:</span>
                <span>₹{(quotation.grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Terms */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] border-b border-slate-100 pb-1">
            Commercial Terms & Conditions
          </h4>
          <p className="text-slate-600"><b>Payment Terms:</b> {quotation.commercialTerms?.paymentTerms}</p>
          <p className="text-slate-600"><b>Delivery Schedule:</b> {quotation.commercialTerms?.deliveryPeriod}</p>
          <p className="text-slate-600"><b>Warranty:</b> {quotation.commercialTerms?.warranty}</p>
          <p className="text-slate-600"><b>Freight:</b> {quotation.commercialTerms?.freightTerms}</p>
        </div>
      </div>
    </Modal>
  );
};

export default QuotationDetailModal;
