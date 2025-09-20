import React, { useState } from 'react';
import { CheckCircle, User, Package, AlertCircle, Loader2, X, Calendar, DollarSign } from 'lucide-react';

// Enhanced FormInput Component
const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  icon: Icon,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`
            w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 
            border-2 rounded-xl transition-all duration-200 
            placeholder:text-gray-400 text-gray-900
            focus:outline-none focus:ring-0
            ${error 
              ? 'border-red-300 bg-red-50 focus:border-red-500' 
              : focused 
                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
          {...props}
        />
      </div>
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};
export default FormInput;