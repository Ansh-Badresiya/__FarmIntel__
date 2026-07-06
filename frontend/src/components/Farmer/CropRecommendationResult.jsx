import React from 'react';
import { Leaf } from 'lucide-react';

export const CropRecommendationResult = ({ result }) => {
  if (!result) return null;

  const { recommended_crop, confidence, soil_data_used, all_recommendations } = result;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6 animate-fade-in">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Results</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-6">
          <p className="text-green-800 font-medium mb-1 flex items-center justify-center">
            <Leaf className="w-5 h-5 mr-2" /> Recommended Crop
          </p>
          <h3 className="text-4xl font-bold text-green-700 capitalize">{recommended_crop}</h3>
          <p className="text-green-600 text-sm mt-2">Confidence: {(confidence * 100).toFixed(1)}%</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">Soil Data Used</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 grid grid-cols-2 gap-y-2">
              <span className="font-medium">Nitrogen (N):</span> <span>{soil_data_used.nitrogen} mg/kg</span>
              <span className="font-medium">Phosphorus (P):</span> <span>{soil_data_used.phosphorus} mg/kg</span>
              <span className="font-medium">Potassium (K):</span> <span>{soil_data_used.potassium} mg/kg</span>
              <span className="font-medium">pH:</span> <span>{soil_data_used.ph}</span>
              <span className="font-medium">Temperature:</span> <span>{soil_data_used.temperature}°C</span>
              <span className="font-medium">Humidity:</span> <span>{soil_data_used.humidity}%</span>
              <span className="font-medium">Rainfall:</span> <span>{soil_data_used.rainfall} mm</span>
              <span className="font-medium">Source:</span> <span className="capitalize">{soil_data_used.source}</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">All Recommendations</h4>
            <div className="space-y-3">
              {all_recommendations && all_recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-center text-sm">
                  <div className="w-24 font-medium text-gray-700 capitalize">{rec.crop}</div>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${idx === 0 ? 'bg-green-600' : 'bg-green-400'}`} 
                      style={{ width: `${rec.confidence * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right text-gray-600">{(rec.confidence * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
