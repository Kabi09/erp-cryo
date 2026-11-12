import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { QuotationManageModal } from '../components/workflow/QuotationManageModal';
import { QuotationModal } from '../components/workflow/QuotationModal';
import { ShareModal } from '../components/workflow/ShareModal';
import { PdfPreviewModal } from '../components/ui/PdfPreviewModal';
import {
  FileSpreadsheet,
  Search,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Eye,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import dayjs from 'dayjs';

export const QuotationsListPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [manageQuotationId, setManageQuotationId] = useState(null);
  const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState(false);
  const [shareData, setShareData] = useState(null); // { id, number, customer, revision, grandTotal }
  const [previewPdfData, setPreviewPdfData] = useState(null); // { endpoint, title, filename }

  const addToast = useToastStore((state) => state.addToast);

  const fetchQuotations = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await api.get('/quotations', { params });
      setQuotations(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch quotations' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations(1);
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuotations(1);
  };

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  const handleOpenPreview = (q, rev) => {
    setPreviewPdfData({
      endpoint: `/quotations/${q._id}/pdf?revisionId=${rev?._id}`,
      title: `Quotation PDF: ${q.quotationNumber} (${rev?.revisionLabel || 'Rev 0'})`,
      filename: `${q.quotationNumber}_${rev?.revisionLabel || 'Quote'}.pdf`,
    });
  };

  const handleOpenShare = (q, rev) => {
    setShareData({
      documentId: q._id,
      documentNumber: q.quotationNumber,
      customer: q.customer,
      revisionLabel: rev?.revisionLabel,
      grandTotal: rev?.grandTotal,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Quotations & Revisions Registry</h1>
            <Badge variant="primary">{pagination.total} Quotations</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 4 to 7: Complete proposal lifecycle — Manage line items, compare/reverse revisions, share with clients, and preview PDFs
          </p>
        </div>

        <Button icon={Plus} onClick={() => setIsCreateQuoteOpen(true)} className="w-full sm:w-auto self-start sm:self-auto">
          Create New Quotation
        </Button>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search quote ref or company name..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-60">
              <Select
                placeholder="All Quotation Statuses"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Customer Review">Customer Review</option>
                <option value="Under Negotiation">Under Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </Select>
            </div>

            <Button type="submit" variant="secondary">
              Filter
            </Button>
            {(search || status) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setStatus('');
                  fetchQuotations(1);
                }}
              >
                Clear
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Quote Ref</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Lead Ref</th>
                <th className="py-3 px-4 text-center">Active Revision</th>
                <th className="py-3 px-4 text-right">Grand Total (INR)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading quotations...</span>
                    </div>
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    No quotations found matching criteria.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => {
                  const rev = q.winningRevision || q.activeRevision;
                  return (
                    <tr
                      key={q._id}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                      onClick={() => setManageQuotationId(q._id)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        <span className="hover:underline flex items-center gap-1.5">
                          {q.quotationNumber}
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {dayjs(q.createdAt).format('DD MMM YYYY')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{q.customer?.companyName || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{q.customer?.customerCode}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {q.lead?.leadNumber}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-sky-50 text-sky-800 border border-sky-200 font-bold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          {rev?.revisionLabel || `Rev ${q.currentRevisionNumber || 0}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatINR(rev?.grandTotal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge size="sm">{q.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          {/* Manage Button */}
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={SlidersHorizontal}
                            onClick={() => setManageQuotationId(q._id)}
                            title="Manage quotation, line items and revisions"
                          >
                            Manage
                          </Button>

                          {/* Share Button */}
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Share2}
                            onClick={() => handleOpenShare(q, rev)}
                            title="Share quotation via Email or Link"
                          >
                            Share
                          </Button>

                          {/* PDF Preview & Download */}
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => handleOpenPreview(q, rev)}
                            title="Preview and Download PDF"
                          >
                            PDF
                          </Button>

                          {/* Lead link */}
                          <Link to={`/leads/${q.lead?._id}`}>
                            <Button variant="ghost" size="sm" icon={ExternalLink} title="Open Lead Workflow Hub" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                onClick={() => fetchQuotations(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchQuotations(pagination.page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* MODALS */}
      <QuotationManageModal
        isOpen={!!manageQuotationId}
        onClose={() => setManageQuotationId(null)}
        quotationId={manageQuotationId}
        onUpdated={() => fetchQuotations(pagination.page)}
      />

      <QuotationModal
        isOpen={isCreateQuoteOpen}
        onClose={() => setIsCreateQuoteOpen(false)}
        onSuccess={() => fetchQuotations(1)}
      />

      {shareData && (
        <ShareModal
          isOpen={!!shareData}
          onClose={() => setShareData(null)}
          type="quotation"
          documentId={shareData.documentId}
          documentNumber={shareData.documentNumber}
          customer={shareData.customer}
          revisionLabel={shareData.revisionLabel}
          grandTotal={shareData.grandTotal}
        />
      )}

      {previewPdfData && (
        <PdfPreviewModal
          isOpen={!!previewPdfData}
          onClose={() => setPreviewPdfData(null)}
          endpoint={previewPdfData.endpoint}
          title={previewPdfData.title}
          filename={previewPdfData.filename}
        />
      )}
    </div>
  );
};
