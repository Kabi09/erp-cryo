import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PaymentFormModal from './PaymentFormModal';
import { Plus, CreditCard, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const { hasRole } = useAuth();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments');
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.patch(`/payments/${id}/verify`, {
        status,
        verificationNotes: `Verified by Accounts Department on ${new Date().toLocaleDateString()}`
      });
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating payment status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customer Payment Receipts & Accounts Verification</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log RTGS/NEFT/Cheque credits, track advance milestones, and authorize finance clearance for SO release.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setFormModalOpen(true)}>
          New Payment Receipt
        </Button>
      </div>

      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Retrieving payment receipts..." />
        ) : payments.length === 0 ? (
          <EmptyState
            title="No payment receipts logged"
            description="Log customer advance payments or balance remittances here."
            actionLabel="Log Payment"
            onAction={() => setFormModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt # / Date</th>
                  <th className="py-3 px-4">Customer & PI Ref</th>
                  <th className="py-3 px-4">Payment Mode & UTR #</th>
                  <th className="py-3 px-4">Amount Credited</th>
                  <th className="py-3 px-4">Finance Status</th>
                  <th className="py-3 px-4 text-right">Accounts Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-900 block">{p.receiptNumber}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{p.customerName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {p.piNumber ? `PI: ${p.piNumber}` : p.customerPoNumber ? `PO: ${p.customerPoNumber}` : 'Direct Advance'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-700 block">{p.paymentMode}</span>
                      <span className="text-[11px] font-mono text-slate-500">{p.transactionId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700 text-sm block">
                        ₹{(p.amountReceived || 0).toLocaleString('en-IN')}
                      </span>
                      {p.tdsDeduction > 0 && (
                        <span className="text-[10px] text-slate-400">TDS: ₹{p.tdsDeduction.toLocaleString('en-IN')}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status === 'Verified' ? 'success' : p.status === 'Rejected' ? 'danger' : 'warning'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'Pending Verification' ? (
                        hasRole('Super Admin', 'Accounts Manager', 'Accounts Executive', 'MD / Director') ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="success"
                              icon={CheckCircle2}
                              onClick={() => handleVerify(p._id, 'Verified')}
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              icon={XCircle}
                              onClick={() => handleVerify(p._id, 'Rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Accounts Only</span>
                        )
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Finance Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PaymentFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSaved={fetchPayments}
      />
    </div>
  );
};

export default PaymentList;
