import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Download, CheckCircle2, XCircle, Send, ShieldAlert, Award } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SalesOrderDetailModal = ({ isOpen, onClose, salesOrder, onUpdated }) => {
  const [loadingStage, setLoadingStage] = useState('');
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('');
  const { user, hasRole } = useAuth();

  if (!salesOrder) return null;

  const handleApproveStage = async (stage, status) => {
    setLoadingStage(stage);
    try {
      await api.patch(`/sales-orders/${salesOrder._id}/approve-stage`, {
        stage,
        status,
        remarks: `${user?.role} approved stage on ${new Date().toLocaleDateString()}`
      });
      onUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating clearance stage');
    } finally {
      setLoadingStage('');
    }
  };

  const handleRelease = async () => {
    setReleaseLoading(true);
    try {
      await api.patch(`/sales-orders/${salesOrder._id}/release`, {
        releaseNotes
      });
      alert('Order successfully released to Production & Purchase departments!');
      onUpdated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error releasing to production');
    } finally {
      setReleaseLoading(false);
    }
  };

  const stages = [
    { id: 'salesApproval', name: 'Sales & Marketing', data: salesOrder.approvals?.salesApproval, roles: ['Super Admin', 'Sales Manager', 'MD / Director'] },
    { id: 'accountsApproval', name: 'Finance & Accounts', data: salesOrder.approvals?.accountsApproval, roles: ['Super Admin', 'Accounts Manager', 'Accounts Executive', 'MD / Director'] },
    { id: 'technicalApproval', name: 'Technical & Engineering', data: salesOrder.approvals?.technicalApproval, roles: ['Super Admin', 'Engineering Manager', 'Estimation Engineer', 'MD / Director'] },
    { id: 'productionFeasibilityApproval', name: 'Production Feasibility', data: salesOrder.approvals?.productionFeasibilityApproval, roles: ['Super Admin', 'Production Manager', 'MD / Director'] },
    { id: 'managementApproval', name: 'Executive Management / MD', data: salesOrder.approvals?.managementApproval, roles: ['Super Admin', 'MD / Director'] }
  ];

  const allApproved = stages.every(s => s.data?.status === 'Approved');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sales Order Dossier — ${salesOrder.soNumber}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-xs">
        {/* Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-brand-900">{salesOrder.customerName}</span>
              <Badge>{salesOrder.soStatus}</Badge>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                PO: {salesOrder.customerPoNumber}
              </span>
            </div>
            <p className="text-slate-500 mt-1">
              SO Date: {new Date(salesOrder.soDate).toLocaleDateString()} • Target Delivery: <b className="text-slate-800">{new Date(salesOrder.deliveryDate).toLocaleDateString()}</b>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/sales-orders/${salesOrder._id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" /> Download SO PDF
            </a>
          </div>
        </div>

        {/* Commercial Figures */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Order Value</span>
            <span className="text-lg font-bold text-brand-900">₹{(salesOrder.soValue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Advance Required</span>
            <span className="text-lg font-bold text-slate-800">₹{(salesOrder.advanceRequired || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Advance Received</span>
            <span className="text-lg font-bold text-emerald-700">₹{(salesOrder.advanceReceived || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Balance Amount</span>
            <span className="text-lg font-bold text-slate-800">₹{(salesOrder.balanceAmount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Products Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="px-4 py-2 bg-slate-100 font-bold uppercase tracking-wider text-[11px] text-slate-700">
            Plant Manufacturing Line Items
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Equipment & Production Specifications</th>
                <th className="py-2.5 px-4">Qty</th>
                <th className="py-2.5 px-4">Unit Rate</th>
                <th className="py-2.5 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesOrder.products?.map((p, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-4 font-semibold text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-4">
                    <span className="font-bold text-slate-800 block">{p.productName} ({p.model || 'Standard'})</span>
                    <span className="text-[11px] text-slate-500">{p.technicalSpecification}</span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{p.quantity} {p.unit || 'Nos'}</td>
                  <td className="py-2.5 px-4">₹{(p.unitPrice || 0).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-brand-900">₹{(p.totalAmount || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5-Department Clearance Matrix */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">
              Multi-Departmental Approval Status (5 Clearance Gates)
            </h4>
            <span className={`text-xs font-bold ${allApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
              {allApproved ? 'All Gates Cleared' : 'Clearances Pending'}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {stages.map((st) => {
              const status = st.data?.status || 'Pending';
              const canAct = hasRole(...st.roles);

              return (
                <div key={st.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-slate-800 block">{st.name}</span>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span>Status: <b className={status === 'Approved' ? 'text-emerald-700' : status === 'Rejected' ? 'text-rose-700' : 'text-amber-700'}>{status}</b></span>
                      {st.data?.approvedByName && <span>• Authorized by: {st.data.approvedByName}</span>}
                      {st.data?.approvedAt && <span>({new Date(st.data.approvedAt).toLocaleDateString()})</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'warning'}>
                      {status}
                    </Badge>

                    {status === 'Pending' && canAct && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="success"
                          icon={CheckCircle2}
                          loading={loadingStage === st.id}
                          onClick={() => handleApproveStage(st.id, 'Approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={XCircle}
                          loading={loadingStage === st.id}
                          onClick={() => handleApproveStage(st.id, 'Rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Release for Execution Section */}
        <div className={`p-4 rounded-xl border ${
          salesOrder.releaseForExecution?.isReleased
            ? 'bg-emerald-50 border-emerald-200'
            : allApproved
            ? 'bg-blue-50/70 border-blue-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          {salesOrder.releaseForExecution?.isReleased ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 text-sm block">RELEASED FOR PRODUCTION EXECUTION</span>
                <span className="text-emerald-700 text-[11px]">
                  Released on {new Date(salesOrder.releaseForExecution.releasedAt).toLocaleDateString()} • Production & Purchase departments notified.
                </span>
              </div>
              <Badge variant="success">Active Manufacturing</Badge>
            </div>
          ) : allApproved ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">All Departmental Clearances Satisfied!</h4>
                  <p className="text-slate-600 text-[11px]">You can now officially release this order to the plant floor and purchase queue.</p>
                </div>
              </div>
              <textarea
                rows={2}
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                placeholder="Release instructions for plant manager and purchase division..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <div className="flex justify-end">
                <Button
                  variant="success"
                  loading={releaseLoading}
                  icon={Send}
                  onClick={handleRelease}
                >
                  Confirm & Release to Production
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Plant release is blocked until all 5 departmental gates (Sales, Finance, Tech, Production, Management) are approved.</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SalesOrderDetailModal;
