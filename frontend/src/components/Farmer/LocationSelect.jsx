import React from 'react';

export const LocationSelect = ({ 
  states, 
  selectedState, 
  onStateChange, 
  disabled 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

