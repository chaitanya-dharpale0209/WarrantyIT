import { CheckCircle, X } from 'lucide-react';
import React from 'react';

const SuccessMessage = ({ message, onClose }) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <p className="text-green-800 font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-green-500 hover:text-green-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};


export default SuccessMessage;