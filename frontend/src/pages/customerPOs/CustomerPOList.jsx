import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import CustomerPOModal from './CustomerPOModal';
import POVerificationModal from './POVerificationModal';
import { Plus, CheckSquare, ShoppingCart, AlertCircle, Eye } from 'lucide-react';
import api from '../../services/api';

const CustomerPOList = () => {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer-pos');
      if (res.data.success) {
        setPos(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const handleVerify = (po) => {
    setSelectedPO(po);
    setVerificationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customer Purchase Order (PO) Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log official purchase orders, perform 3-way match against Quotation & PI, and flag contract variances.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setFormModalOpen(true)}>
          Receive Customer PO
        </Button>
      </div>

      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Retrieving customer purchase orders..." />
        ) : pos.length === 0 ? (
          <EmptyState
            title="No Customer POs logged"
            description="When a client issues their official purchase order, log it here to start the 3-way verification."
            actionLabel="Log PO"
            onAction={() => setFormModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt ID / Customer PO #</th>
                  <th className="py-3 px-4">Customer Name & Ref Quote</th>
                  <th className="py-3 px-4">PO Total Value (INR)</th>
                  <th className="py-3 px-4">PO Date / Delivery</th>
                  <th className="py-3 px-4">3-Way Match Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pos.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-900 block">{po.customerPoNumber}</span>
                      <span className="text-[11px] font-mono text-slate-400">ID: {po.receiptId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{po.customerName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Quote: {po.quotationNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{(po.poValue || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="block">Date: {new Date(po.customerPoDate).toLocaleDateString()}</span>
                      <span className="text-[11px] text-slate-400">
                        Delivery: {po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : '4-6 weeks'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={po.verificationStatus === 'Verified' ? 'success' : po.verificationStatus === 'Mismatch' ? 'danger' : 'warning'}>
                        {po.verificationStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant={po.verificationStatus === 'Verified' ? 'outline' : 'primary'}
                          icon={CheckSquare}
                          onClick={() => handleVerify(po)}
                        >
                          {po.verificationStatus === 'Verified' ? 'View Match' : '3-Way Match'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CustomerPOModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSaved={fetchPOs}
      />

      <POVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        customerPO={selectedPO}
        onVerified={fetchPOs}
      />
    </div>
  );
};

export default CustomerPOList;
