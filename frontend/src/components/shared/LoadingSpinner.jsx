import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ fullScreen = false }) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-white/80 z-50"
    : "flex items-center justify-center p-4";
    
  return (
    <div className={containerClass}>
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  );
};
