import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import { Button } from '../ui/Button';
import {
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCheck2,
  PackageCheck,
  Factory,
  Trophy,
  XCircle,
  MessageSquare
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const LeadTimeline = ({ leadId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [posting, setPosting] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leads/${leadId}/activities`);
      setActivities(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchActivities();
    }
  }, [leadId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      addToast({ type: 'warning', title: 'Note Required', message: 'Please provide note title' });
      return;
    }

    try {
      setPosting(true);
      await api.post(`/leads/${leadId}/activities`, {
        title: noteTitle,
        description: noteDescription,
        activityType: 'GENERAL_NOTE',
      });
      setNoteTitle('');
      setNoteDescription('');
      addToast({ type: 'success', title: 'Note Logged', message: 'Activity note added to timeline' });
      fetchActivities();
    } catch (err) {
      addToast({ type: 'error', title: 'Failed', message: 'Could not add note' });
    } finally {
      setPosting(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'LEAD_CREATED':
        return <Clock className="w-4 h-4 text-sky-600" />;
      case 'LEAD_QUALIFIED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'LEAD_DISQUALIFIED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'QUOTATION_CREATED':
      case 'QUOTATION_REVISED':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'QUOTATION_WON':
        return <Trophy className="w-4 h-4 text-emerald-600" />;
      case 'QUOTATION_LOST':
        return <XCircle className="w-4 h-4 text-slate-500" />;
      case 'PO_UPLOADED':
      case 'PO_AMENDMENT_SUBMITTED':
        return <FileCheck2 className="w-4 h-4 text-purple-600" />;
      case 'PO_VERIFICATION_PASSED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'PO_VERIFICATION_FAILED':
      case 'PO_AMENDMENT_REQUESTED':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'SO_CREATED':
        return <PackageCheck className="w-4 h-4 text-teal-600" />;
      case 'PRODUCTION_HANDOVER':
        return <Factory className="w-4 h-4 text-emerald-700 font-bold" />;
      case 'CUSTOMER_FEEDBACK':
      case 'NEGOTIATION_NOTE':
        return <MessageSquare className="w-4 h-4 text-sky-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Quick note composer */}
      <form onSubmit={handleAddNote} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
          <span>Add Commercial Note / Follow-up Entry</span>
        </div>
        <input
          type="text"
          placeholder="Note Title (e.g. Discussed LN2 tank valve specs with Lab Head)"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-sky-500 bg-white"
        />
        <textarea
          rows="2"
          placeholder="Additional conversation details or agreed next steps..."
          value={noteDescription}
          onChange={(e) => setNoteDescription(e.target.value)}
          className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-sky-500 bg-white"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={posting} icon={Send}>
            Post to Timeline
          </Button>
        </div>
      </form>

      {/* Timeline entries list */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading timeline audit events...</div>
        ) : activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No events logged for this lead yet.</div>
        ) : (
          activities.map((act) => (
            <div key={act._id} className="relative group">
              {/* Event node */}
              <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-2xs group-hover:border-sky-600 transition">
                {getActivityIcon(act.activityType)}
              </div>

              {/* Event card */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{act.title}</h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                    {dayjs(act.createdAt).format('DD MMM YYYY, hh:mm A')}
                  </span>
                </div>
                {act.description && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{act.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  <span className="font-medium text-slate-600">Logged by: {act.user?.name || 'Sales Admin'}</span>
                  <span>•</span>
                  <span>{dayjs(act.createdAt).fromNow()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

