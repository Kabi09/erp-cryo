import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToastStore } from '../../store/useToastStore';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import { PhoneCall, Calendar, User, MessageSquare, Trash2, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

export const FollowUpModal = ({
  isOpen,
  onClose,
  lead,
  followUpToEdit = null, // If null -> Add Mode, if object -> Edit / Modify Mode
  onSaved,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const addToast = useToastStore((state) => state.addToast);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    followUpDate: dayjs().format('YYYY-MM-DD'),
    status: 'INTERESTED',
    notes: '',
    nextFollowUpDate: '',
    conductedByName: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (followUpToEdit) {
        setFormData({
          followUpDate: followUpToEdit.followUpDate
            ? dayjs(followUpToEdit.followUpDate).format('YYYY-MM-DD')
            : dayjs().format('YYYY-MM-DD'),
          status: followUpToEdit.status || 'INTERESTED',
          notes: followUpToEdit.notes || '',
          nextFollowUpDate: followUpToEdit.nextFollowUpDate
            ? dayjs(followUpToEdit.nextFollowUpDate).format('YYYY-MM-DD')
            : '',
          conductedByName: followUpToEdit.conductedByName || currentUser?.name || 'Sales Representative',
        });
      } else {
        setFormData({
          followUpDate: dayjs().format('YYYY-MM-DD'),
          status: 'INTERESTED',
          notes: '',
          nextFollowUpDate: '',
          conductedByName: currentUser?.name || 'Sales Representative',
        });
      }
    }
  }, [isOpen, followUpToEdit, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead?._id) return;

    if (!formData.notes.trim()) {
      addToast({
        type: 'warning',
        title: 'Note Required',
        message: 'Please enter brief follow-up remarks or client response.',
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        followUpDate: formData.followUpDate,
        status: formData.status,
        notes: formData.notes.trim(),
        nextFollowUpDate: formData.nextFollowUpDate || null,
        conductedByName: formData.conductedByName.trim() || currentUser?.name || 'Sales Representative',
      };

      let res;
      if (followUpToEdit) {
        res = await api.put(`/leads/${lead._id}/follow-ups/${followUpToEdit._id}`, payload);
        addToast({
          type: 'success',
          title: 'Follow-up Updated',
          message: 'The follow-up record has been updated successfully.',
        });
      } else {
        res = await api.post(`/leads/${lead._id}/follow-ups`, payload);
        addToast({
          type: 'success',
          title: 'Follow-up Recorded',
          message: 'New interaction logged for this lead.',
        });
      }

      if (onSaved) {
        onSaved(res.data.data);
      }
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.response?.data?.message || 'Failed to save follow-up details.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lead?._id || !followUpToEdit?._id) return;
    if (!window.confirm('Are you sure you want to delete this follow-up record?')) return;

    try {
      setDeleting(true);
      const res = await api.delete(`/leads/${lead._id}/follow-ups/${followUpToEdit._id}`);
      addToast({
        type: 'success',
        title: 'Follow-up Deleted',
        message: 'The follow-up entry has been removed.',
      });
      if (onSaved) {
        onSaved(res.data.data);
      }
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.response?.data?.message || 'Could not delete follow-up.',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={followUpToEdit ? 'Modify Follow-Up Record' : 'Log Lead Follow-Up'}
      subtitle={
        lead
          ? `Lead: ${lead.leadNumber} • ${lead.companyName} (${lead.contactPerson?.name || 'Client'})`
          : 'Record client response and schedule next touchpoint'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Follow-up Date"
            type="date"
            required
            icon={Calendar}
            value={formData.followUpDate}
            onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
          />

          <Select
            label="Outcome / Client Response"
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="INTERESTED">INTERESTED</option>
            <option value="NOT INTERESTED">NOT INTERESTED</option>
            <option value="NO RESPONSE">NO RESPONSE</option>
            <option value="FOLLOW UP LATER">FOLLOW UP LATER</option>
            <option value="BUSY">BUSY / CALL BACK</option>
            <option value="MEETING SCHEDULED">MEETING SCHEDULED</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
              Follow-up Comment / Remarks
            </span>
            <span className="text-[11px] text-slate-400 font-normal">e.g. "send message", "rejected", "later"</span>
          </label>
          <textarea
            rows="3"
            required
            placeholder='e.g. "send message", "demo requested", "requested revision of pricing"'
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                Next Follow-up Date
              </label>
              {formData.nextFollowUpDate && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, nextFollowUpDate: '' })}
                  className="text-[10px] text-slate-400 hover:text-rose-600 underline"
                >
                  Clear Date
                </button>
              )}
            </div>
            <Input
              type="date"
              value={formData.nextFollowUpDate}
              onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
              placeholder="Leave blank if no follow-up scheduled"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {formData.nextFollowUpDate ? 'Scheduled for callback' : 'Displayed as: "No next follow-up date"'}
            </p>
          </div>

          <Input
            label="Conducted By (Sales Rep)"
            placeholder="e.g. Ananya Sharma"
            icon={User}
            required
            value={formData.conductedByName}
            onChange={(e) => setFormData({ ...formData, conductedByName: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {followUpToEdit ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Trash2}
              loading={deleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving || deleting}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} icon={CheckCircle2}>
              {followUpToEdit ? 'Save Changes' : 'Record Follow-up'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

