import { Loader2 } from 'lucide-react';
import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return <Loader2 className={`${sizeClasses[size]} animate-spin`} />;
};


export default LoadingSpinner;