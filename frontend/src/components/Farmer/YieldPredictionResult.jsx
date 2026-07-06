import React from 'react';
import { TrendingUp } from 'lucide-react';

export const YieldPredictionResult = ({ result }) => {
  if (!result) return null;

  const { predicted_yield, unit, confidence_interval, features_used } = result;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6 animate-fade-in">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Results</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center mb-6">
          <p className="text-blue-800 font-medium mb-1 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 mr-2" /> Predicted Yield
          </p>
          <h3 className="text-4xl font-bold text-blue-700">
            {predicted_yield} <span className="text-xl text-blue-600 font-medium">{unit}</span>
          </h3>
          <div className="mt-4 inline-flex items-center bg-white px-4 py-2 rounded-md shadow-sm text-sm border border-blue-100">
            <span className="text-gray-500 mr-2">Confidence Interval:</span>
            <span className="font-semibold text-blue-800">{confidence_interval.lower}</span>
            <span className="mx-2 text-gray-400">-</span>
            <span className="font-semibold text-blue-800">{confidence_interval.upper}</span>
            <span className="ml-1 text-gray-500">{unit}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">Features Used</h4>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 text-xs">Crop</p>
              <p className="font-medium capitalize">{features_used.crop}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Season</p>
              <p className="font-medium capitalize">{features_used.season}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">State</p>
              <p className="font-medium">{features_used.state || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Area</p>
              <p className="font-medium">{features_used.area} ha</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Rainfall</p>
              <p className="font-medium">{features_used.rainfall} mm</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Temperature</p>
              <p className="font-medium">{features_used.temperature}°C</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Irrigation</p>
              <p className="font-medium capitalize">{features_used.irrigation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
