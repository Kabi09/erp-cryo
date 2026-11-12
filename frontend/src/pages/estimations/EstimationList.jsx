import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import EstimationFormModal from './EstimationFormModal';
import EstimationDetailModal from './EstimationDetailModal';
import { Plus, Eye, Edit2, Calculator, CheckCircle2, FileText } from 'lucide-react';
import api from '../../services/api';

const EstimationList = () => {
  const [estimations, setEstimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEstimation, setSelectedEstimation] = useState(null);

  const fetchEstimations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/estimations', { params });
      if (res.data.success) {
        setEstimations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load estimations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimations();
  }, [statusFilter]);

  const handleCreate = () => {
    setSelectedEstimation(null);
    setFormModalOpen(true);
  };

  const handleView = (est) => {
    setSelectedEstimation(est);
    setDetailModalOpen(true);
  };

  const handleEdit = (est) => {
    setSelectedEstimation(est);
    setFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Internal Product Cost Estimation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            BOM costing breakdown, raw material, cascade compressor, sensors, testing, and margin governance.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleCreate}>
          New Cost Estimation
        </Button>
      </div>

      {/* Filter Bar */}
      <Card noPadding>
        <div className="p-4 flex items-center justify-between gap-3 bg-white rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Approval Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-600"
            >
              <option value="">All Statuses</option>
              <option>Pending Approval</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Revised</option>
            </select>
          </div>
          <Button size="sm" variant="secondary" onClick={fetchEstimations}>
            Refresh
          </Button>
        </div>
      </Card>

      {/* Estimations Table */}
      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Loading costing records..." />
        ) : estimations.length === 0 ? (
          <EmptyState
            title="No estimations created"
            description="Create an internal costing sheet for an active enquiry."
            actionLabel="New Estimation"
            onAction={handleCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Estimate # / Date</th>
                  <th className="py-3 px-4">Enquiry # & Client</th>
                  <th className="py-3 px-4">BOM Estimated Cost</th>
                  <th className="py-3 px-4">Proposed Selling Price</th>
                  <th className="py-3 px-4">Grand Total (Incl. GST)</th>
                  <th className="py-3 px-4">Status & Rev</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {estimations.map((est) => (
                  <tr key={est._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-900 block">{est.estimateNumber}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(est.estimateDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{est.customerName}</span>
                      <span className="text-[11px] text-brand-700 font-mono">{est.enquiryNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">₹{(est.totalCost || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">₹{(est.totalSellingPrice || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-900 text-sm">₹{(est.grandTotal || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge>{est.status}</Badge>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          R{est.revisionNumber || 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(est)}
                          title="View / Review Estimation"
                          className="p-1.5 text-slate-500 hover:text-brand-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(est)}
                          title="Revise Costing"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <EstimationFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        estimation={selectedEstimation}
        onSaved={fetchEstimations}
      />

      <EstimationDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        estimation={selectedEstimation}
        onReviewed={fetchEstimations}
      />
    </div>
  );
};

export default EstimationList;
