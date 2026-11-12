import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { FileCheck2, Search, Download, ChevronLeft, ChevronRight, ExternalLink, ClipboardCheck } from 'lucide-react';
import dayjs from 'dayjs';

export const PurchaseOrdersListPage = () => {
  const [pos, setPos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');

  const addToast = useToastStore((state) => state.addToast);

  const fetchPOs = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (verificationStatus) params.verificationStatus = verificationStatus;

      const res = await api.get('/purchase-orders', { params });
      setPos(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch Purchase Orders' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs(1);
  }, [verificationStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPOs(1);
  };

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Purchase Orders (PO)</h1>
            <Badge variant="primary">{pagination.total} Received</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 9 & 10: Official customer purchase orders pending or cleared through Five-Point Verification
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search PO number or item summary..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-60">
              <Select
                placeholder="All Verification Statuses"
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
              >
                <option value="Unverified">Unverified</option>
                <option value="Passed">Passed (Cleared for SO)</option>
                <option value="Failed_Mismatch">Failed Mismatch (SO Blocked)</option>
                <option value="Amendment_Requested">Amendment Requested</option>
              </Select>
            </div>

            <Button type="submit" variant="secondary">
              Filter
            </Button>
            {(search || verificationStatus) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setVerificationStatus('');
                  fetchPOs(1);
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer PO Number</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Item & Specifications</th>
                <th className="py-3 px-4">Committed Delivery Date</th>
                <th className="py-3 px-4 text-right">PO Value (INR)</th>
                <th className="py-3 px-4 text-center">Version</th>
                <th className="py-3 px-4">5-Point Verification Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading purchase orders...</span>
                    </div>
                  </td>
                </tr>
              ) : pos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    No customer purchase orders found.
                  </td>
                </tr>
              ) : (
                pos.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      <Link to={`/leads/${po.lead?._id}`} className="hover:underline">
                        {po.poNumber}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-normal">
                        PO Date: {dayjs(po.poDate).format('DD MMM YYYY')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{po.customer?.companyName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{po.customer?.customerCode}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="truncate font-medium text-slate-800">{po.itemSummary}</div>
                      <div className="text-[10px] text-slate-400">Qty: {po.quantity} Nos</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {dayjs(po.deliveryDate).format('DD MMM YYYY')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatINR(po.poValue)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded">
                        v{po.amendmentVersion || 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge size="sm">{po.verificationStatus}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {po.documentPath && (
                          <a
                            href={po.documentPath}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Link to={`/leads/${po.lead?._id}`}>
                          <Button variant="secondary" size="sm" icon={ExternalLink}>
                            Verify / Manage
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
                onClick={() => fetchPOs(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchPOs(pagination.page + 1)}
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

