import React from 'react';

export const SoilInputFields = ({ values, onChange, errors, disabled }) => {
  const handleChange = (field, value) => {
    onChange({ ...values, [field]: value === '' ? '' : Number(value) });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg mt-4 border border-gray-200">
      <div>
        <label className="block text-sm text-gray-700 font-medium">Nitrogen (N) <span className="text-gray-400 font-normal ml-1">mg/kg</span></label>
        <input
          type="number"
          value={values.nitrogen}
          onChange={(e) => handleChange('nitrogen', e.target.value)}
          disabled={disabled}
          className={`mt-1 block w-full px-3 py-2 border ${errors.nitrogen ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
        />
        {errors.nitrogen && <p className="text-red-500 text-xs mt-1">{errors.nitrogen}</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-700 font-medium">Phosphorus (P) <span className="text-gray-400 font-normal ml-1">mg/kg</span></label>
        <input
          type="number"
          value={values.phosphorus}
          onChange={(e) => handleChange('phosphorus', e.target.value)}
          disabled={disabled}
          className={`mt-1 block w-full px-3 py-2 border ${errors.phosphorus ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
        />
        {errors.phosphorus && <p className="text-red-500 text-xs mt-1">{errors.phosphorus}</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-700 font-medium">Potassium (K) <span className="text-gray-400 font-normal ml-1">mg/kg</span></label>
        <input
          type="number"
          value={values.potassium}
          onChange={(e) => handleChange('potassium', e.target.value)}
          disabled={disabled}
          className={`mt-1 block w-full px-3 py-2 border ${errors.potassium ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
        />
        {errors.potassium && <p className="text-red-500 text-xs mt-1">{errors.potassium}</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-700 font-medium">Soil pH</label>
        <input
          type="number"
          step="0.1"
          value={values.ph}
          onChange={(e) => handleChange('ph', e.target.value)}
          disabled={disabled}
          className={`mt-1 block w-full px-3 py-2 border ${errors.ph ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
        />
        {errors.ph && <p className="text-red-500 text-xs mt-1">{errors.ph}</p>}
      </div>
    </div>
  );
};
