import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PdfPreviewModal } from '../components/ui/PdfPreviewModal';
import { ShareModal } from '../components/workflow/ShareModal';
import { Modal } from '../components/ui/Modal';
import {
  Receipt,
  Download,
  Share2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Building2
} from 'lucide-react';
import dayjs from 'dayjs';

export const ProformaInvoicesListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Modals
  const [previewPdfData, setPreviewPdfData] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [managePI, setManagePI] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const fetchPIs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/proforma-invoices', { params: { page, limit: 10 } });
      setInvoices(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch Proforma Invoices' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPIs(1);
  }, []);

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  const handleOpenPreview = (pi) => {
    setPreviewPdfData({
      endpoint: `/proforma-invoices/${pi._id}/pdf`,
      title: `Proforma Invoice: ${pi.piNumber}`,
      filename: `${pi.piNumber}.pdf`,
    });
  };

  const handleOpenShare = (pi) => {
    setShareData({
      documentId: pi._id,
      documentNumber: pi.piNumber,
      customer: pi.customer,
      grandTotal: pi.grandTotal,
    });
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!managePI) return;
    try {
      setStatusUpdating(true);
      await api.put(`/proforma-invoices/${managePI._id}/status`, {
        status: newStatus,
      });
      addToast({ type: 'success', title: 'Status Updated', message: `PI status marked as ${newStatus}` });
      setManagePI({ ...managePI, status: newStatus });
      fetchPIs(pagination.page);
    } catch (err) {
      addToast({ type: 'error', title: 'Update Failed', message: 'Could not update PI status' });
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Proforma Invoices (PI)</h1>
            <Badge variant="primary">{pagination.total} Records</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 8: Pre-sale commercial billing documents — Manage payments, share with clients, and preview PDFs
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">PI Ref</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Won Quote Ref</th>
                <th className="py-3 px-4">Lead Ref</th>
                <th className="py-3 px-4 text-right">Invoice Value (INR)</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    No Proforma Invoices issued yet.
                  </td>
                </tr>
              ) : (
                invoices.map((pi) => (
                  <tr
                    key={pi._id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => setManagePI(pi)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      <span className="hover:underline flex items-center gap-1.5">{pi.piNumber}</span>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {dayjs(pi.piDate).format('DD MMM YYYY')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{pi.customer?.companyName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{pi.customer?.customerCode}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800">
                      {pi.quotation?.quotationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {pi.lead?.leadNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {formatINR(pi.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="primary" size="sm">{pi.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleOpenPreview(pi)}
                          title="Preview & Download PDF"
                        >
                          PDF
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Share2}
                          onClick={() => handleOpenShare(pi)}
                          title="Share with client"
                        >
                          Share
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setManagePI(pi)}
                        >
                          Manage
                        </Button>
                        <Link to={`/leads/${pi.lead?._id}`}>
                          <Button variant="ghost" size="sm" icon={ExternalLink} title="Open Lead Workflow" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Page <span className="font-semibold text-slate-800">{pagination.page}</span> of{' '}
              <span className="font-semibold text-slate-800">{pagination.pages}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchPIs(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchPIs(pagination.page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* MANAGE PI MODAL */}
      {managePI && (
        <Modal
          isOpen={!!managePI}
          onClose={() => setManagePI(null)}
          title={`Proforma Invoice: ${managePI.piNumber}`}
          subtitle={`Customer: ${managePI.customer?.companyName || 'N/A'} | Issued: ${dayjs(managePI.piDate).format('DD MMM YYYY')}`}
          size="lg"
        >
          <div className="space-y-5 text-xs">
            {/* Status & Actions */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary" size="md">{managePI.status}</Badge>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Eye}
                  onClick={() => handleOpenPreview(managePI)}
                >
                  View PDF
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Share2}
                  onClick={() => handleOpenShare(managePI)}
                >
                  Share
                </Button>
                {managePI.status !== 'Advance Received' && (
                  <Button
                    size="sm"
                    variant="success"
                    loading={statusUpdating}
                    onClick={() => handleUpdateStatus('Advance Received')}
                  >
                    Mark Advance Received
                  </Button>
                )}
                {managePI.status !== 'Paid' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={statusUpdating}
                    onClick={() => handleUpdateStatus('Paid')}
                  >
                    Mark Fully Paid
                  </Button>
                )}
              </div>
            </div>

            {/* Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Total Amount:</span>
                <span className="font-bold text-emerald-700 text-sm">{formatINR(managePI.grandTotal)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Quotation Reference:</span>
                <span className="font-semibold text-slate-900">{managePI.quotation?.quotationNumber || 'On file'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Bank Name:</span>
                <span className="font-semibold text-slate-900">{managePI.bankDetails?.bankName || 'SBI'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Account Number:</span>
                <span className="font-mono font-semibold text-slate-900">{managePI.bankDetails?.accountNumber || '382910482019'}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Equipment</th>
                    <th className="p-3 w-20 text-center">Qty</th>
                    <th className="p-3 w-28 text-right">Unit Rate</th>
                    <th className="p-3 w-32 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {managePI.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900">{it.productName}</td>
                      <td className="p-3 text-center">{it.quantity} Nos</td>
                      <td className="p-3 text-right">{formatINR(it.unitPrice)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatINR(it.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF PREVIEW MODAL */}
      {previewPdfData && (
        <PdfPreviewModal
          isOpen={!!previewPdfData}
          onClose={() => setPreviewPdfData(null)}
          endpoint={previewPdfData.endpoint}
          title={previewPdfData.title}
          filename={previewPdfData.filename}
        />
      )}

      {/* SHARE MODAL */}
      {shareData && (
        <ShareModal
          isOpen={!!shareData}
          onClose={() => setShareData(null)}
          type="pi"
          documentId={shareData.documentId}
          documentNumber={shareData.documentNumber}
          customer={shareData.customer}
          grandTotal={shareData.grandTotal}
        />
      )}
    </div>
  );
};
