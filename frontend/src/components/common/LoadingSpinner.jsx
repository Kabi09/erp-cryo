import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading records...', size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <Loader2 className={`${sizes[size]} animate-spin text-brand-900 mb-3`} />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
