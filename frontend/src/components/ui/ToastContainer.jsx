import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />,
  };

  const borderMap = {
    success: 'border-l-4 border-l-emerald-600 bg-emerald-50/90 text-emerald-950',
    error: 'border-l-4 border-l-red-600 bg-red-50/90 text-red-950',
    warning: 'border-l-4 border-l-amber-600 bg-amber-50/90 text-amber-950',
    info: 'border-l-4 border-l-sky-600 bg-sky-50/90 text-sky-950',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-lg border border-slate-200 backdrop-blur-sm transition-all duration-200 animate-slide-in ${borderMap[toast.type] || borderMap.info}`}
        >
          {iconMap[toast.type] || iconMap.info}
          <div className="flex-1 text-xs">
            {toast.title && <div className="font-semibold text-sm mb-0.5">{toast.title}</div>}
            <div className="text-slate-700 leading-relaxed">{toast.message}</div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

