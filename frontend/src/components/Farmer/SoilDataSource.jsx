import React from 'react';

export const SoilDataSource = ({ source, onSourceChange, disabled }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 border-b pb-2">Soil Data Source</h3>
      <div className="flex flex-col space-y-3">
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="soilSource"
            value="auto"
            checked={source === 'auto'}
            onChange={() => onSourceChange('auto')}
            disabled={disabled}
            className="form-radio text-green-600 focus:ring-green-500 h-4 w-4"
          />
          <span className="ml-2 text-gray-700">Use Regional Average Data</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="soilSource"
            value="manual"
            checked={source === 'manual'}
            onChange={() => onSourceChange('manual')}
            disabled={disabled}
            className="form-radio text-green-600 focus:ring-green-500 h-4 w-4"
          />
          <span className="ml-2 text-gray-700">Enter Manual Soil Values</span>
        </label>
      </div>
    </div>
  );
};
