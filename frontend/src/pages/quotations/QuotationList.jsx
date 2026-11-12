import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import QuotationFormModal from './QuotationFormModal';
import QuotationDetailModal from './QuotationDetailModal';
import NegotiationFormModal from '../negotiations/NegotiationFormModal';
import { Plus, Eye, Download, RotateCcw, FileText, Send, MessageSquare } from 'lucide-react';
import api from '../../services/api';

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [reviseSourceQuotation, setReviseSourceQuotation] = useState(null);

  const [negotiationModalOpen, setNegotiationModalOpen] = useState(false);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/quotations', { params });
      if (res.data.success) {
        setQuotations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load quotations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter]);

  const handleCreate = () => {
    setReviseSourceQuotation(null);
    setFormModalOpen(true);
  };

  const handleView = (q) => {
    setSelectedQuotation(q);
    setDetailModalOpen(true);
  };

  const handleRevise = (q) => {
    setReviseSourceQuotation(q);
    setFormModalOpen(true);
  };

  const handleNegotiate = (q) => {
    setSelectedQuotation(q);
    setNegotiationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Commercial Quotation Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-version formal pricing proposals (V1, V2, V3...), PDF dispatch, and approval loops.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleCreate}>
          New Quotation (V1)
        </Button>
      </div>

      {/* Filter */}
      <Card noPadding>
        <div className="p-4 flex items-center justify-between gap-3 bg-white rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Quotation Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-600"
            >
              <option value="">All Statuses</option>
              <option>Pending Approval</option>
              <option>Approved</option>
              <option>Sent</option>
              <option>Under Negotiation</option>
              <option>Accepted</option>
              <option>Rejected</option>
              <option>Revised</option>
            </select>
          </div>
          <Button size="sm" variant="secondary" onClick={fetchQuotations}>
            Refresh
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Retrieving quotations..." />
        ) : quotations.length === 0 ? (
          <EmptyState
            title="No quotations on record"
            description="Generate a quotation from an approved engineering estimation."
            actionLabel="New Quotation"
            onAction={handleCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Quote # & Version</th>
                  <th className="py-3 px-4">Customer & Enquiry</th>
                  <th className="py-3 px-4">Grand Total (INR)</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Quotation Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-900">{q.quotationNumber}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-900">
                          {q.versionLabel || 'V1'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(q.quotationDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{q.customerName}</span>
                      <span className="text-[11px] text-brand-700 font-mono">{q.enquiryNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-900 text-sm">₹{(q.grandTotal || 0).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 block">{q.products?.length || 1} Product line(s)</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '30 Days'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge>{q.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(q)}
                          title="View Quotation Dossier"
                          className="p-1.5 text-slate-500 hover:text-brand-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`/api/quotations/${q._id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          title="Download PDF"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        {(q.status === 'Sent' || q.status === 'Under Negotiation') && (
                          <>
                            <button
                              onClick={() => handleRevise(q)}
                              title="Create Revised Version"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleNegotiate(q)}
                              title="Customer Response (Accept / Negotiate)"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <QuotationFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        reviseSourceQuotation={reviseSourceQuotation}
        onSaved={fetchQuotations}
      />

      <QuotationDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        quotation={selectedQuotation}
        onActionCompleted={fetchQuotations}
        onRevise={handleRevise}
        onNegotiate={handleNegotiate}
      />

      <NegotiationFormModal
        isOpen={negotiationModalOpen}
        onClose={() => setNegotiationModalOpen(false)}
        quotation={selectedQuotation}
        onSaved={fetchQuotations}
      />
    </div>
  );
};

export default QuotationList;
