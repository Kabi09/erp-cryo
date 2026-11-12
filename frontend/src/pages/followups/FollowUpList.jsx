import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import FollowUpFormModal from './FollowUpFormModal';
import { Plus, Phone, Mail, MessageSquare, CalendarCheck, Clock, CalendarX } from 'lucide-react';
import api from '../../services/api';

const FollowUpList = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState('all'); // 'all', 'today', 'overdue', 'upcoming'
  const [formModalOpen, setFormModalOpen] = useState(false);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const params = {};
      if (tabFilter !== 'all') params.filter = tabFilter;

      const res = await api.get('/followups', { params });
      if (res.data.success) {
        setFollowUps(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load follow-ups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [tabFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customer Follow-up Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete sequential log of discussions, customer reactions, demos, and scheduled reminder dates.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setFormModalOpen(true)}>
          Log Follow-up
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'all', label: 'All Interactions', icon: CalendarCheck },
          { id: 'today', label: "Today's Schedule", icon: Clock },
          { id: 'overdue', label: 'Overdue Follow-ups', icon: CalendarX },
          { id: 'upcoming', label: 'Upcoming Follow-ups', icon: CalendarCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setTabFilter(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                tabFilter === tab.id
                  ? 'border-brand-600 text-brand-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Follow-up Entries List */}
      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Retrieving follow-up history..." />
        ) : followUps.length === 0 ? (
          <EmptyState
            title="No follow-up entries found"
            description="Log your daily calls, client demos, or technical clarifications."
            actionLabel="Add Follow-up"
            onAction={() => setFormModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {followUps.map((fol) => (
              <div key={fol._id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-brand-900">{fol.followUpId}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-xs text-slate-800">{fol.customerName}</span>
                    <span className="text-[11px] font-mono text-brand-700">({fol.enquiryNumber})</span>
                    <Badge>{fol.customerResponse}</Badge>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {fol.followUpType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">{fol.discussionDetails}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Contact: <b className="text-slate-600">{fol.contactPerson || 'Client'}</b></span>
                    <span>Officer: <b className="text-slate-600">{fol.assignedTo?.name || 'Assigned Staff'}</b></span>
                    <span>Date: {new Date(fol.followUpDate).toLocaleDateString()} at {fol.followUpTime}</span>
                  </div>
                </div>

                {fol.nextFollowUpDate && (
                  <div className="text-right sm:self-center shrink-0 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-blue-800 block">Next Action Date</span>
                    <span className="text-xs font-extrabold text-blue-900">
                      {new Date(fol.nextFollowUpDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <FollowUpFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSaved={fetchFollowUps}
      />
    </div>
  );
};

export default FollowUpList;
