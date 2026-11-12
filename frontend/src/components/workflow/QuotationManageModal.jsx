import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  Share2,
  Printer,
  RotateCcw,
  Plus,
  Trophy,
  XCircle,
  MessageSquare,
  Receipt,
  FileCheck2,
  ArrowRight,
  Eye,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import dayjs from 'dayjs';
import { downloadPdfBlob } from '../../utils/pdfDownloader';
import { PdfPreviewModal } from '../ui/PdfPreviewModal';
import { ShareModal } from './ShareModal';
import { QuotationModal } from './QuotationModal';
import { CustomerFeedbackModal } from './CustomerFeedbackModal';
import { MarkWonModal } from './MarkWonModal';
import { ProformaInvoiceModal } from './ProformaInvoiceModal';

export const QuotationManageModal = ({
  isOpen,
  onClose,
  quotationId,
  onUpdated,
}) => {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);

  // Sub-modals
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isMarkWonModalOpen, setIsMarkWonModalOpen] = useState(false);
  const [isPIModalOpen, setIsPIModalOpen] = useState(false);

  // Revert / Reopen loading
  const [reverting, setReverting] = useState(false);
  const [reopening, setReopening] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const fetchQuotation = async () => {
    if (!quotationId) return;
    try {
      setLoading(true);
      const res = await api.get(`/quotations/${quotationId}`);
      setQuotation(res.data.data);
      if (!selectedRevisionId && res.data.data.activeRevision) {
        setSelectedRevisionId(res.data.data.activeRevision._id);
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch quotation details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && quotationId) {
      fetchQuotation();
    }
  }, [isOpen, quotationId]);

  if (!isOpen) return null;

  const revisions = quotation?.revisions || [];
  const currentRevision =
    revisions.find((r) => r._id === selectedRevisionId) ||
    quotation?.activeRevision ||
    quotation?.winningRevision ||
    revisions[0];

  const isActiveRev = quotation?.activeRevision?._id === currentRevision?._id;
  const isWonRev = quotation?.winningRevision?._id === currentRevision?._id;
  const isWon = quotation?.status === 'Won';
  const isLost = quotation?.status === 'Lost';

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  // Reverse / Revert Active Revision
  const handleRevertRevision = async (rev) => {
    if (isActiveRev && !isWon && !isLost) {
      addToast({ type: 'info', title: 'Already Active', message: `${rev.revisionLabel} is already the active revision` });
      return;
    }

    if (!window.confirm(`Are you sure you want to make ${rev.revisionLabel} the active commercial proposal for this quotation?`)) {
      return;
    }

    try {
      setReverting(true);
      const res = await api.post(`/quotations/${quotation._id}/revert-revision`, {
        revisionId: rev._id,
        reason: `Reverted active proposal to ${rev.revisionLabel}`,
      });

      addToast({
        type: 'success',
        title: 'Active Revision Switched',
        message: `Active proposal successfully reversed to ${rev.revisionLabel}!`,
      });
      fetchQuotation();
      if (onUpdated) onUpdated();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Revert Failed',
        message: err.response?.data?.message || 'Failed to switch active revision',
      });
    } finally {
      setReverting(false);
    }
  };

  // Reopen Quotation
  const handleReopenQuotation = async () => {
    if (!window.confirm('Reopen this quotation for further negotiation and commercial revisions?')) {
      return;
    }

    try {
      setReopening(true);
      await api.post(`/quotations/${quotation._id}/reopen`, {
        reopenRemarks: 'Reopened by Sales Admin for further revisions and commercial discussions',
      });

      addToast({
        type: 'success',
        title: 'Quotation Reopened',
        message: 'Status set back to Under Negotiation. You can now revise and adjust terms.',
      });
      fetchQuotation();
      if (onUpdated) onUpdated();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Reopen Failed',
        message: err.response?.data?.message || 'Could not reopen quotation',
      });
    } finally {
      setReopening(false);
    }
  };

  const handleDownloadPDF = async () => {
    const revId = currentRevision?._id;
    const filename = `${quotation.quotationNumber}_${currentRevision?.revisionLabel || 'Quote'}.pdf`;
    try {
      await downloadPdfBlob(`/quotations/${quotation._id}/pdf?revisionId=${revId}`, filename);
      addToast({ type: 'success', title: 'Downloaded', message: `Saved ${filename}` });
    } catch (err) {
      addToast({ type: 'error', title: 'Download Failed', message: 'Failed to download PDF' });
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Manage Quotation: ${quotation?.quotationNumber || 'Loading...'}`}
        subtitle="Manage revisions, switch active revision, share with client, and track approvals"
        size="full"
      >
        {loading || !quotation ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading quotation management suite...
          </div>
        ) : (
          <div className="space-y-5">
            {/* Action Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                    {quotation.quotationNumber}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{quotation.customer?.companyName}</h3>
                  <Badge size="md">{quotation.status}</Badge>
                  {isWon && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-emerald-600" /> Won on {dayjs(quotation.wonDate).format('DD MMM YYYY')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Contact: {quotation.customer?.contactPerson?.name || 'N/A'} • {quotation.customer?.email} • {quotation.customer?.phone}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={() => setIsPdfPreviewOpen(true)}
                >
                  Preview PDF
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Download}
                  onClick={handleDownloadPDF}
                >
                  Download PDF
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Share2}
                  onClick={() => setIsShareModalOpen(true)}
                >
                  Share
                </Button>

                {!isWon && !isLost ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={MessageSquare}
                      onClick={() => setIsFeedbackModalOpen(true)}
                    >
                      Feedback
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() => setIsRevisionModalOpen(true)}
                    >
                      Revise ({`Rev ${quotation.currentRevisionNumber + 1}`})
                    </Button>

                    <Button
                      variant="success"
                      size="sm"
                      icon={Trophy}
                      onClick={() => setIsMarkWonModalOpen(true)}
                    >
                      Mark Won
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RotateCcw}
                    loading={reopening}
                    onClick={handleReopenQuotation}
                  >
                    Reopen Negotiation
                  </Button>
                )}

                {isWon && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Receipt}
                    onClick={() => setIsPIModalOpen(true)}
                  >
                    Issue PI
                  </Button>
                )}
              </div>
            </div>

            {/* Revision Switcher & History Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                  Revisions:
                </span>
                {revisions.map((rev) => {
                  const isSelected = (selectedRevisionId ? selectedRevisionId === rev._id : quotation.activeRevision?._id === rev._id);
                  const isRevActive = quotation.activeRevision?._id === rev._id;
                  const isRevWon = quotation.winningRevision?._id === rev._id;

                  return (
                    <button
                      key={rev._id}
                      onClick={() => setSelectedRevisionId(rev._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{rev.revisionLabel}</span>
                      {isRevWon && <span className="text-[10px] bg-emerald-500 text-white px-1 rounded">Won</span>}
                      {isRevActive && !isRevWon && <span className="text-[10px] bg-sky-800 text-white px-1 rounded">Active</span>}
                    </button>
                  );
                })}
              </div>

              {/* Revert / Reverse button for this revision */}
              {currentRevision && !isActiveRev && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={RotateCcw}
                  loading={reverting}
                  onClick={() => handleRevertRevision(currentRevision)}
                  title="Switch and set this revision as the active commercial offer"
                >
                  Reverse to {currentRevision.revisionLabel}
                </Button>
              )}
            </div>

            {/* Selected Revision Details */}
            {currentRevision && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                {/* Revision Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {quotation.quotationNumber} — {currentRevision.revisionLabel}
                      </h4>
                      {isActiveRev && <Badge variant="primary" size="sm">Active Commercial Offer</Badge>}
                      {isWonRev && <Badge variant="success" size="sm">Winning Revision</Badge>}
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      <span className="font-semibold text-slate-700">Reason / Scope:</span>{' '}
                      {currentRevision.revisionReason || 'Initial proposal'}
                    </p>
                  </div>

                  <div className="text-right text-slate-500">
                    <div>Issued: {dayjs(currentRevision.createdAt).format('DD MMM YYYY, hh:mm A')}</div>
                    <div>Validity: {currentRevision.validityDays || 30} Days</div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[640px]">
                    <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Equipment / Product Description</th>
                        <th className="p-3 w-20 text-center">HSN</th>
                        <th className="p-3 w-20 text-center">Qty</th>
                        <th className="p-3 w-28 text-right">Unit Rate</th>
                        <th className="p-3 w-20 text-center">Disc %</th>
                        <th className="p-3 w-20 text-center">GST %</th>
                        <th className="p-3 w-32 text-right">Line Total (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentRevision.items?.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{it.productName}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{it.specification}</div>
                          </td>
                          <td className="p-3 text-center text-slate-600">{it.hsnCode || '841869'}</td>
                          <td className="p-3 text-center font-bold text-slate-800">{it.quantity} {it.unit || 'Nos'}</td>
                          <td className="p-3 text-right text-slate-700">{formatINR(it.unitPrice)}</td>
                          <td className="p-3 text-center text-slate-600">{it.discountPercent || 0}%</td>
                          <td className="p-3 text-center text-slate-600">{it.gstRate || 18}%</td>
                          <td className="p-3 text-right font-bold text-slate-900">{formatINR(it.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex justify-end">
                  <div className="w-full sm:w-80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Gross Sub-Total:</span>
                      <span className="font-semibold text-slate-900">{formatINR(currentRevision.subTotal)}</span>
                    </div>
                    {currentRevision.totalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Discount Savings:</span>
                        <span>- {formatINR(currentRevision.totalDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Taxable Value:</span>
                      <span className="font-semibold text-slate-900">{formatINR(currentRevision.taxableAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST (18%):</span>
                      <span className="font-semibold text-slate-900">{formatINR(currentRevision.totalGst)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-sky-950">
                      <span>Grand Total:</span>
                      <span className="text-sky-700">{formatINR(currentRevision.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Commercial Terms */}
                <div className="p-4 border-t border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block">Payment Terms:</span>
                    <span className="text-slate-600">{currentRevision.paymentTerms}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Delivery Lead Time:</span>
                    <span className="text-slate-600">{currentRevision.deliveryPeriod}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Standard Warranty:</span>
                    <span className="text-slate-600">{currentRevision.warranty}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Freight & Inspection:</span>
                    <span className="text-slate-600">{currentRevision.freightTerms}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Review Feedback History */}
            {quotation.customerFeedback && quotation.customerFeedback.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  Customer Feedback & Negotiation Log
                </h4>
                <div className="space-y-2">
                  {quotation.customerFeedback.map((fb, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between items-center font-semibold text-slate-800">
                        <span>{fb.feedbackType}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {dayjs(fb.date).format('DD MMM YYYY, hh:mm A')} by {fb.recordedBy?.name || 'Sales Admin'}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{fb.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Sub-Modals */}
      {quotation && (
        <>
          <PdfPreviewModal
            isOpen={isPdfPreviewOpen}
            onClose={() => setIsPdfPreviewOpen(false)}
            endpoint={`/quotations/${quotation._id}/pdf?revisionId=${currentRevision?._id}`}
            title={`Quotation PDF: ${quotation.quotationNumber} (${currentRevision?.revisionLabel || 'Rev 0'})`}
            filename={`${quotation.quotationNumber}_${currentRevision?.revisionLabel || 'Quote'}.pdf`}
          />

          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            type="quotation"
            documentId={quotation._id}
            documentNumber={quotation.quotationNumber}
            customer={quotation.customer}
            revisionLabel={currentRevision?.revisionLabel}
            grandTotal={currentRevision?.grandTotal}
          />

          <QuotationModal
            isOpen={isRevisionModalOpen}
            onClose={() => setIsRevisionModalOpen(false)}
            lead={quotation.lead}
            existingQuotation={quotation}
            isRevision={true}
            onSuccess={() => {
              fetchQuotation();
              if (onUpdated) onUpdated();
            }}
          />

          <CustomerFeedbackModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            quotation={quotation}
            onUpdated={() => {
              fetchQuotation();
              if (onUpdated) onUpdated();
            }}
          />

          <MarkWonModal
            isOpen={isMarkWonModalOpen}
            onClose={() => setIsMarkWonModalOpen(false)}
            quotation={quotation}
            onUpdated={() => {
              fetchQuotation();
              if (onUpdated) onUpdated();
            }}
          />

          <ProformaInvoiceModal
            isOpen={isPIModalOpen}
            onClose={() => setIsPIModalOpen(false)}
            quotation={quotation}
            lead={quotation.lead}
            onUpdated={() => {
              fetchQuotation();
              if (onUpdated) onUpdated();
            }}
          />
        </>
      )}
    </>
  );
};

