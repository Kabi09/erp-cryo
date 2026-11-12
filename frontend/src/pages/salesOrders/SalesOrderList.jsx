import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SalesOrderFormModal from './SalesOrderFormModal';
import SalesOrderDetailModal from './SalesOrderDetailModal';
import { Plus, Eye, Download, CheckCircle2, Factory, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const SalesOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSO, setSelectedSO] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/sales-orders', { params });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleView = (so) => {
    setSelectedSO(so);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sales Order (SO) Management & Execution</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Final stage of Enquiry-to-SO workflow with 5-department clearance gates and plant release.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setFormModalOpen(true)}>
          New Sales Order
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 flex items-center justify-between gap-3 bg-white rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Order Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-600"
            >
              <option value="">All Statuses</option>
              <option value="Pending Approvals">Pending Approvals</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Released to Production">Released to Production</option>
              <option value="In Manufacturing">In Manufacturing</option>
            </select>
          </div>
          <Button size="sm" variant="secondary" onClick={fetchOrders}>
            Refresh
          </Button>
        </div>
      </Card>

      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Retrieving sales orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Sales Orders on record"
            description="Book confirmed orders from verified purchase orders."
            actionLabel="Create Sales Order"
            onAction={() => setFormModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">SO # / Date</th>
                  <th className="py-3 px-4">Customer & PO #</th>
                  <th className="py-3 px-4">Order Value (INR)</th>
                  <th className="py-3 px-4">Advance Received</th>
                  <th className="py-3 px-4">Clearance Matrix</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {orders.map((so) => {
                  const approvalsList = Object.values(so.approvals || {});
                  const approvedCount = approvalsList.filter(a => a?.status === 'Approved').length;

                  return (
                    <tr key={so._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-brand-900 block">{so.soNumber}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(so.soDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{so.customerName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          PO: {so.customerPoNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{(so.soValue || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Due: {new Date(so.deliveryDate).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-700 block">
                          ₹{(so.advanceReceived || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Req: ₹{(so.advanceRequired || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            approvedCount === 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {approvedCount} / 5 Cleared
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge>{so.soStatus}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleView(so)}
                            title="Manage Clearances & Release"
                            className="p-1.5 text-slate-500 hover:text-brand-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/api/sales-orders/${so._id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            title="Download SO PDF"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <SalesOrderFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSaved={fetchOrders}
      />

      <SalesOrderDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        salesOrder={selectedSO}
        onUpdated={fetchOrders}
      />
    </div>
  );
};

export default SalesOrderList;
