import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import LeadDecisionModal from './LeadDecisionModal';
import { Plus, Award, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';

const LeadList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/leads', { params });
      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Lead Conversion & Won / Lost Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor final decision outcomes, win drivers, and analytical lost-deal reasons.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setDecisionModalOpen(true)}>
          Record Lead Decision
        </Button>
      </div>

      {/* Filter */}
      <Card noPadding>
        <div className="p-4 flex items-center justify-between gap-3 bg-white rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Filter Outcome:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-600"
            >
              <option value="">All Outcomes</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <Button size="sm" variant="secondary" onClick={fetchLeads}>
            Refresh
          </Button>
        </div>
      </Card>

      {/* Leads Table */}
      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Retrieving lead outcomes..." />
        ) : leads.length === 0 ? (
          <EmptyState
            title="No lead decision records"
            description="Track customer purchasing decisions to analyze your sales win/loss ratio."
            actionLabel="Record Outcome"
            onAction={() => setDecisionModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Enquiry # & Client</th>
                  <th className="py-3 px-4">Outcome Status</th>
                  <th className="py-3 px-4">Primary Reason</th>
                  <th className="py-3 px-4">Expected Deal Value</th>
                  <th className="py-3 px-4">Decision Date</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-900 block">{lead.customerName}</span>
                      <span className="text-[11px] font-mono text-slate-500">{lead.enquiryNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={lead.leadStatus === 'Won' ? 'success' : lead.leadStatus === 'Lost' ? 'danger' : 'warning'}>
                        {lead.leadStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {lead.reason}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{(lead.expectedOrderValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(lead.decisionDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {lead.remarks || 'No notes added'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <LeadDecisionModal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        onSaved={fetchLeads}
      />
    </div>
  );
};

export default LeadList;
