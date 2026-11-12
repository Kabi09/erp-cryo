import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ProductionHandoverModal } from '../components/workflow/ProductionHandoverModal';
import {
  PackageCheck,
  Search,
  Factory,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  FileText,
  AlertCircle
} from 'lucide-react';
import dayjs from 'dayjs';

export const SalesOrdersListPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [selectedSO, setSelectedSO] = useState(null);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await api.get('/sales-orders', { params });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch Sales Orders' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleOpenHandover = (so) => {
    setSelectedSO(so);
    setIsHandoverOpen(true);
  };

  const handleOpenDetail = (so) => {
    setSelectedSO(so);
    setIsDetailOpen(true);
  };

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  const handedOverCount = orders.filter((o) => o.productionHandover?.isHandedOver).length;
  const pendingHandoverCount = orders.filter((o) => !o.productionHandover?.isHandedOver).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Sales Orders (SO) Registry</h1>
            <Badge variant="primary">{pagination.total} Total</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 11 & 12: Confirmed commercial sales orders, committed dispatch schedules, and shop-floor Production Handover sign-offs
          </p>
        </div>

        {/* Quick status summary cards */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl text-center flex-1 sm:flex-initial">
            <span className="block text-[11px] font-semibold text-emerald-800">Handed Over</span>
            <span className="text-sm font-bold text-emerald-700">{handedOverCount}</span>
          </div>
          <div className="bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl text-center flex-1 sm:flex-initial">
            <span className="block text-[11px] font-semibold text-amber-800">Handover Pending</span>
            <span className="text-sm font-bold text-amber-700">{pendingHandoverCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search SO number, customer or PO..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-64">
              <Select
                placeholder="All Statuses"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Handed Over to Production">Handed Over to Production</option>
                <option value="In Production">In Production</option>
                <option value="Ready for Dispatch">Ready for Dispatch</option>
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
                  fetchOrders(1);
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
          <table className="w-full text-left text-xs text-slate-600 min-w-[720px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">SO Number</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Customer PO Ref</th>
                <th className="py-3 px-4">Committed Dispatch</th>
                <th className="py-3 px-4 text-right">Order Value (INR)</th>
                <th className="py-3 px-4">Production Handover Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading sales orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    No sales orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((so) => {
                  const isHandedOver = so.productionHandover?.isHandedOver;
                  return (
                    <tr
                      key={so._id}
                      className="hover:bg-sky-50/40 transition cursor-pointer"
                      onClick={() => handleOpenDetail(so)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        <span className="hover:underline">{so.soNumber}</span>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {dayjs(so.soDate).format('DD MMM YYYY')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="font-bold text-slate-900">{so.customer?.companyName || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{so.customer?.customerCode}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {so.customerPO?.poNumber || 'Ref Attached'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {dayjs(so.committedDispatchDate).format('DD MMM YYYY')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatINR(so.grandTotal)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isHandedOver ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Factory className="w-3.5 h-3.5 text-emerald-600" />
                            Handed Over ({dayjs(so.productionHandover.handoverDate).format('DD MMM')})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Handover Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-1.5">
                          {!isHandedOver && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={Factory}
                              onClick={() => handleOpenHandover(so)}
                              title="Handover to Production Shop-Floor"
                            >
                              Handover
                            </Button>
                          )}

                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => handleOpenDetail(so)}
                            title="View Sales Order Details"
                          >
                            Details
                          </Button>

                          <Link to={`/sales-orders/${so._id}`} title="Full Order Workspace">
                            <Button variant="ghost" size="sm" icon={ExternalLink} />
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
                onClick={() => fetchOrders(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchOrders(pagination.page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* SO Detail Modal */}
      {isDetailOpen && selectedSO && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Sales Order: ${selectedSO.soNumber}`}
          subtitle={`Commercial Release | Customer: ${selectedSO.customer?.companyName || 'N/A'}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Top Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
              <div>
                <span className="text-xs text-slate-400 block">SO Date:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {dayjs(selectedSO.soDate).format('DD MMMM YYYY')}
                </span>
                <div className="mt-1">
                  <Badge variant={selectedSO.productionHandover?.isHandedOver ? 'success' : 'warning'}>
                    {selectedSO.status}
                  </Badge>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Grand Total (Incl. GST):</span>
                <span className="text-xl font-extrabold text-sky-900">{formatINR(selectedSO.grandTotal)}</span>
              </div>
            </div>

            {/* Key Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
              <div>
                <span className="text-slate-400 block">Customer PO Reference:</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {selectedSO.customerPO?.poNumber || 'PO Reference'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Committed Dispatch Date:</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {dayjs(selectedSO.committedDispatchDate).format('DD MMMM YYYY')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Delivery Schedule Terms:</span>
                <span className="font-medium text-slate-700 mt-0.5 block">
                  {selectedSO.deliverySchedule || 'As agreed in quotation'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Special Instructions:</span>
                <span className="font-medium text-slate-700 mt-0.5 block">
                  {selectedSO.specialInstructions || 'Standard manufacturing testing protocol'}
                </span>
              </div>
            </div>

            {/* Production Handover Sign-off Status */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-800">Stage 12: Production Handover Sign-Off</span>
                </div>
                <Badge variant={selectedSO.productionHandover?.isHandedOver ? 'success' : 'warning'}>
                  {selectedSO.productionHandover?.isHandedOver ? 'Completed' : 'Pending Sign-Off'}
                </Badge>
              </div>

              <div className="p-4 text-xs space-y-2">
                {selectedSO.productionHandover?.isHandedOver ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-950">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Handover Released to Manufacturing Shop-Floor
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[11px] text-emerald-800">
                      <div>
                        Handover Date: {dayjs(selectedSO.productionHandover.handoverDate).format('DD MMM YYYY, hh:mm A')}
                      </div>
                      <div>
                        Target Manufacturing Completion: {selectedSO.productionHandover.targetCompletionDate ? dayjs(selectedSO.productionHandover.targetCompletionDate).format('DD MMM YYYY') : 'Committed Schedule'}
                      </div>
                    </div>
                    {selectedSO.productionHandover.remarks && (
                      <p className="mt-2 text-[11px] text-emerald-900 italic border-t border-emerald-200 pt-1.5">
                        Remarks: {selectedSO.productionHandover.remarks}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-950 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Pending Formal Production Handover</span>
                        <p className="mt-0.5 text-amber-900">
                          Complete the handover sign-off to formally close the commercial sales workflow and release equipment specifications to the factory.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      icon={Factory}
                      onClick={() => {
                        setIsDetailOpen(false);
                        handleOpenHandover(selectedSO);
                      }}
                    >
                      Sign-Off Now
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
              <Link to={`/sales-orders/${selectedSO._id}`}>
                <Button icon={ExternalLink}>Open Full SO Page</Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Handover Modal */}
      {isHandoverOpen && selectedSO && (
        <ProductionHandoverModal
          isOpen={isHandoverOpen}
          onClose={() => setIsHandoverOpen(false)}
          salesOrder={selectedSO}
          onUpdated={() => {
            fetchOrders(pagination.page);
            setIsHandoverOpen(false);
          }}
        />
      )}
    </div>
  );
};
