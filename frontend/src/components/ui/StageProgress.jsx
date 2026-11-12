import React from 'react';
import { Check, Clock, AlertCircle, ArrowRight } from 'lucide-react';

const STAGES = [
  { id: 'ENQUIRY_RECEIVED', label: '1. Enquiry' },
  { id: 'QUALIFICATION', label: '2. Qualify' },
  { id: 'CUSTOMER_MAPPED', label: '3. Customer' },
  { id: 'QUOTATION_DRAFTED', label: '4. Quotation' },
  { id: 'CUSTOMER_REVIEW', label: '5. Review' },
  { id: 'QUOTATION_NEGOTIATION', label: '6. Revision' },
  { id: 'QUOTATION_WON', label: '7. Won' },
  { id: 'PI_ISSUED', label: '8. Proforma Inv' },
  { id: 'PO_RECEIVED', label: '9. Customer PO' },
  { id: 'PO_VERIFICATION', label: '10. 5-Point Check' },
  { id: 'SO_CREATED', label: '11. Sales Order' },
  { id: 'PRODUCTION_HANDOVER', label: '12. Handover' },
];

export const StageProgress = ({ currentStage, status }) => {
  // Map aliases or intermediate stages
  let normalizedStage = currentStage;
  if (currentStage === 'QUOTATION_SENT') normalizedStage = 'QUOTATION_DRAFTED';
  if (currentStage === 'PO_AMENDMENT_PENDING') normalizedStage = 'PO_VERIFICATION';

  const currentIndex = STAGES.findIndex((s) => s.id === normalizedStage);
  const currentStageObj = STAGES[currentIndex >= 0 ? currentIndex : 0];
  const isLost = status === 'Lost' || currentStage === 'QUOTATION_LOST';
  const isDisqualified = status === 'Disqualified';
  const progressPercent = Math.min(Math.round(((currentIndex + 1) / STAGES.length) * 100), 100);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-3">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sales Workflow Pipeline</span>
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
            Stage {currentIndex >= 0 ? currentIndex + 1 : 1} of 12
          </span>
          <span className="text-[11px] font-bold text-slate-700 hidden sm:inline">
            ({currentStageObj.label.split('. ')[1]})
          </span>
        </div>

        <div>
          {isLost ? (
            <span className="text-xs font-medium text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 inline-flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Deal Lost
            </span>
          ) : isDisqualified ? (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Disqualified Lead
            </span>
          ) : currentIndex === 11 ? (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Handed Over to Production
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium">
              {progressPercent}% Complete
            </span>
          )}
        </div>
      </div>

      {/* Mobile Stage Highlight Card (Visible on small screens) */}
      <div className="md:hidden bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-slate-500 text-[11px]">Active Milestone:</span>
          <span className="font-bold text-sky-700">{currentStageObj.label}</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLost ? 'bg-red-500' : isDisqualified ? 'bg-amber-500' : 'bg-sky-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stepper horizontal track (Swipeable on mobile with smooth scrolling) */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 -mx-1 px-1">
        <div className="flex items-center min-w-[760px]">
          {STAGES.map((stage, idx) => {
            const isCompleted = currentIndex > idx;
            const isCurrent = currentIndex === idx;
            const isPending = currentIndex < idx;

            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center flex-1 min-w-[60px] text-center group cursor-default">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? isLost
                          ? 'bg-red-600 text-white ring-4 ring-red-100'
                          : 'bg-sky-600 text-white ring-4 ring-sky-100 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] font-medium leading-tight max-w-[68px] truncate ${
                      isCurrent
                        ? 'text-sky-700 font-bold'
                        : isCompleted
                        ? 'text-slate-700 font-medium'
                        : 'text-slate-400'
                    }`}
                    title={stage.label}
                  >
                    {stage.label.split('. ')[1]}
                  </span>
                </div>

                {idx < STAGES.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 -mt-4 transition-colors ${
                      currentIndex > idx ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
