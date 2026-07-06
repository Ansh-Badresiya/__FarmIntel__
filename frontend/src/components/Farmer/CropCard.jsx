import React from 'react';
import { Sprout, TrendingUp, BarChart2 } from 'lucide-react';

/**
 * CropCard — displays a single crop result inside an expanded category accordion.
 *
 * Props:
 *   crop: {
 *     rank, crop, frequency, probability, predicted_yield_kg_per_ha
 *   }
 */
export const CropCard = ({ crop }) => {
  const RANK_MEDALS = ['🥇', '🥈', '🥉'];
  const medal = RANK_MEDALS[crop.rank - 1] ?? `#${crop.rank}`;

  const yieldDisplay =
    crop.predicted_yield_kg_per_ha != null
      ? `${crop.predicted_yield_kg_per_ha.toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg/ha`
      : 'N/A';

  return (
    <div className="
      bg-white border border-gray-100 rounded-lg p-4
      hover:border-green-200 hover:shadow-sm
      transition-all duration-200
      animate-fadeIn
    ">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{medal}</span>
          <h4 className="font-semibold text-gray-900 text-sm">{crop.crop}</h4>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Yield */}
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500 leading-tight">Expected Yield</p>
          <p className="text-sm font-bold text-green-700 mt-0.5">{yieldDisplay}</p>
        </div>

        {/* Historical Probability */}
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <BarChart2 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500 leading-tight">Hist. Probability</p>
          <p className="text-sm font-bold text-blue-700 mt-0.5">
            {(crop.probability * 100).toFixed(1)}%
          </p>
        </div>

        {/* Frequency */}
        <div className="text-center p-2 bg-amber-50 rounded-lg">
          <Sprout className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500 leading-tight">Frequency</p>
          <p className="text-sm font-bold text-amber-700 mt-0.5">
            {crop.frequency.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
};
