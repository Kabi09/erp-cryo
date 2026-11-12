import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PIFormModal from './PIFormModal';
import { Plus, Download, CheckCircle2, Receipt, Eye } from 'lucide-react';
import api from '../../services/api';

const PIList = () => {
  const [pis, setPis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);

  const fetchPIs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/proforma-invoices');
      if (res.data.success) {
        setPis(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPIs();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/proforma-invoices/${id}/approve`);
      fetchPIs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving PI');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Proforma Invoice (PI) Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Commercial proforma billing tied to accepted quotation revisions with advance payment schedules.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setFormModalOpen(true)}>
          Generate New PI
        </Button>
      </div>

      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Retrieving proforma invoices..." />
        ) : pis.length === 0 ? (
          <EmptyState
            title="No Proforma Invoices issued"
            description="Generate a PI after a quotation is accepted by the customer to collect advance payments."
            actionLabel="Generate PI"
            onAction={() => setFormModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">PI # / Date</th>
                  <th className="py-3 px-4">Client & Quote Ref</th>
                  <th className="py-3 px-4">Total Amount (INR)</th>
                  <th className="py-3 px-4">Advance Payable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pis.map((pi) => (
                  <tr key={pi._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-900 block">{pi.piNumber}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(pi.piDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{pi.customerName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Quote: {pi.quotationNumber} ({pi.quotationVersion})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{(pi.totalPiAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700 block">
                        ₹{(pi.advanceAmount || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400">({pi.advancePercentage}% advance)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge>{pi.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {pi.status === 'Pending Approval' && (
                          <button
                            onClick={() => handleApprove(pi._id)}
                            title="Approve PI"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <a
                          href={`/api/proforma-invoices/${pi._id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          title="Download PI PDF"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PIFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSaved={fetchPIs}
      />
    </div>
  );
};

export default PIList;
