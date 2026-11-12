import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

export const QualifyModal = ({ isOpen, onClose, lead, onUpdated }) => {
  const [status, setStatus] = useState('Qualified');
  const [notes, setNotes] = useState('');
  const [budgetConfirmed, setBudgetConfirmed] = useState(true);
  const [decisionMakerIdentified, setDecisionMakerIdentified] = useState(true);
  const [requirementClarity, setRequirementClarity] = useState('High');
  const [loading, setLoading] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      addToast({
        type: 'warning',
        title: 'Validation',
        message: 'Please provide qualification assessment notes',
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(`/leads/${lead._id}/qualify`, {
        status,
        qualificationNotes: notes,
        budgetConfirmed,
        decisionMakerIdentified,
        requirementClarity,
      });

      addToast({
        type: 'success',
        title: 'Lead Qualification Updated',
        message: res.data.message,
      });

      onUpdated(res.data.data);
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Qualification Failed',
        message: err.response?.data?.message || 'Failed to update qualification',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lead Qualification Assessment"
      subtitle="Stage 2: Verify budget, decision authority, and technical specifications"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Qualification Decision <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('Qualified')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition ${
                status === 'Qualified'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Qualified Lead
            </button>
            <button
              type="button"
              onClick={() => setStatus('Disqualified')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition ${
                status === 'Disqualified'
                  ? 'border-red-600 bg-red-50 text-red-800 ring-2 ring-red-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-4 h-4 text-red-600" />
              Disqualified Lead
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={budgetConfirmed}
              onChange={(e) => setBudgetConfirmed(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>Commercial purchase budget confirmed / available</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={decisionMakerIdentified}
              onChange={(e) => setDecisionMakerIdentified(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>Key technical decision-maker / HOD identified</span>
          </label>
        </div>

        <Select
          label="Requirement & Specification Clarity"
          value={requirementClarity}
          onChange={(e) => setRequirementClarity(e.target.value)}
        >
          <option value="High">High - Standard catalogue equipment</option>
          <option value="Medium">Medium - Standard model with optional canisters/valves</option>
          <option value="Custom Specification Required">Custom Specification Required - Requires drawing</option>
          <option value="Low">Low - Exploratory query</option>
        </Select>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Qualification Notes & Evaluation <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="3"
            required
            className="block w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
            placeholder="Record technical feasibility, budget discussions, and why this lead is qualified..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} variant={status === 'Qualified' ? 'success' : 'danger'}>
            Confirm {status}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

