import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Receipt, Download, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import dayjs from 'dayjs';

export const ProformaInvoicesListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

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

  const handleDownloadPDF = (piId) => {
    window.open(`/api/proforma-invoices/${piId}/pdf`, '_blank');
  };

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Proforma Invoices (PI)</h1>
            <Badge variant="primary">{pagination.total} Records</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 8: Pre-sale commercial billing documents generated from Won Quotations
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">PI Number</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Won Quotation Ref</th>
                <th className="py-3 px-4">Lead Ref</th>
                <th className="py-3 px-4 text-right">Invoice Value (INR)</th>
                <th className="py-3 px-4">Status</th>
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
                  <tr key={pi._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      {pi.piNumber}
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
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Download}
                          onClick={() => handleDownloadPDF(pi._id)}
                        >
                          PDF
                        </Button>
                        <Link to={`/leads/${pi.lead?._id}`}>
                          <Button variant="secondary" size="sm" icon={ExternalLink}>
                            Workflow
                          </Button>
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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
    </div>
  );
};

