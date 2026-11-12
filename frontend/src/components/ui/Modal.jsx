import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showClose = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-7xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
        <div
          className={`w-full ${sizeClasses[size] || sizeClasses.md} transform overflow-hidden rounded-xl sm:rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200 my-4`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4 gap-3 bg-white sticky top-0 z-10">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                {title}
              </h3>
              {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">{subtitle}</p>}
            </div>
            {showClose && (
              <button
                type="button"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shrink-0 mt-0.5"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-3.5 sm:p-6 max-h-[calc(100dvh-5.5rem)] sm:max-h-[calc(100vh-10rem)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
