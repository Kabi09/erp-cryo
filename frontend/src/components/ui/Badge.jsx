import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-sky-50 text-sky-700 border-sky-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  // Automated variant selection based on children text if no explicit non-default variant
  let computedVariant = variant;
  if (variant === 'default' && typeof children === 'string') {
    const text = children.toUpperCase();
    if (text.includes('WON') || text.includes('PASSED') || text.includes('QUALIFIED') || text.includes('MATCH') || text.includes('HANDED OVER')) {
      computedVariant = 'success';
    } else if (text.includes('LOST') || text.includes('MISMATCH') || text.includes('FAILED') || text.includes('DISQUALIFIED') || text.includes('CANCELLED')) {
      computedVariant = 'danger';
    } else if (text.includes('NEGOTIATION') || text.includes('REVIEW') || text.includes('PENDING') || text.includes('AMENDMENT') || text.includes('PROGRESS')) {
      computedVariant = 'warning';
    } else if (text.includes('DRAFT') || text.includes('NEW') || text.includes('ENQUIRY') || text.includes('UNVERIFIED')) {
      computedVariant = 'default';
    } else if (text.includes('ISSUED') || text.includes('RECEIVED') || text.includes('CONFIRMED') || text.includes('ORDER')) {
      computedVariant = 'primary';
    }
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[computedVariant] || variantStyles.default} ${sizeStyles[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
};

