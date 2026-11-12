import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-brand-900 border-blue-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  // Automatic variant detection by status text if variant is default
  let computedVariant = variant;
  if (variant === 'default' && typeof children === 'string') {
    const text = children.toLowerCase();
    if (['won', 'approved', 'verified', 'completed', 'active', 'confirmed', 'released to production', 'accepted', 'fully paid'].some(s => text.includes(s))) {
      computedVariant = 'success';
    } else if (['pending', 'under estimation', 'under negotiation', 'partially paid', 'scheduled', 'on hold'].some(s => text.includes(s))) {
      computedVariant = 'warning';
    } else if (['lost', 'rejected', 'mismatch', 'cancelled', 'inactive', 'overdue'].some(s => text.includes(s))) {
      computedVariant = 'danger';
    } else if (['quotation sent', 'po received', 'submitted', 'draft'].some(s => text.includes(s))) {
      computedVariant = 'primary';
    }
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[computedVariant] || variants.default} ${sizes[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80"></span>
      {children}
    </span>
  );
};

export default Badge;
