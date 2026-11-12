import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';

const NegotiationList = () => {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNegotiations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/negotiations');
      if (res.data.success) {
        setNegotiations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const handleReview = async (id, status) => {
    try {
      await api.patch(`/negotiations/${id}/review`, {
        managerApprovalStatus: status,
        managerRemarks: `Manager ${status.toLowerCase()} commercial counter-offer.`
      });
      fetchNegotiations();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating approval');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Commercial Negotiations & Approvals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate client counter-offers, requested discount concessions, and manager approvals.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={fetchNegotiations}>
          Refresh
        </Button>
      </div>

      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Retrieving negotiations..." />
        ) : negotiations.length === 0 ? (
          <EmptyState
            title="No active negotiations"
            description="When clients submit counter-offers on sent quotations, they will appear here for manager clearance."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {negotiations.map((neg) => (
              <div key={neg._id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-900">{neg.quotationNumber}</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {neg.versionLabel}
                    </span>
                    <Badge>{neg.customerResponse}</Badge>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-800">{neg.customerName}</span>
                  </div>

                  <p className="text-slate-700"><b>Remarks:</b> {neg.customerRemarks}</p>

                  {neg.customerResponse === 'Negotiation' && (
                    <div className="flex items-center gap-4 text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      <span>Discount Requested: <b className="text-amber-800">{neg.requestedDiscountPercent}%</b></span>
                      <span>Target Price: <b className="text-amber-900">₹{(neg.revisedTargetPrice || 0).toLocaleString('en-IN')}</b></span>
                      {neg.technicalChanges && <span>Tech: <i>{neg.technicalChanges}</i></span>}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block">
                    Recorded on {new Date(neg.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {neg.managerApprovalStatus === 'Pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="success"
                      icon={CheckCircle2}
                      onClick={() => handleReview(neg._id, 'Approved')}
                    >
                      Approve Offer
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={XCircle}
                      onClick={() => handleReview(neg._id, 'Rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NegotiationList;
