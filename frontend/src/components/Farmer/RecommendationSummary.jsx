import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trophy, TrendingUp, Tag } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * RecommendationSummary — "Top Recommended Crops" panel.
 * Collapsed by default; clicking the button reveals the already-available data.
 *
 * Props:
 *   topCrops: Array<{ rank, crop, category, category_probability, predicted_yield_kg_per_ha }>
 */
export const RecommendationSummary = ({ topCrops }) => {
  const [visible, setVisible] = useState(false);

  if (!topCrops || topCrops.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="
          w-full flex items-center justify-between p-5
          bg-gradient-to-r from-green-600 to-emerald-500
          text-white text-left group
          hover:from-green-700 hover:to-emerald-600
          transition-all duration-200
        "
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5" />
          <div>
            <p className="font-semibold text-base">Top Recommended Crops</p>
            <p className="text-green-100 text-xs mt-0.5">
              Overall best crops ranked across all categories
            </p>
          </div>
        </div>
        {visible
          ? <ChevronUp  className="w-5 h-5 opacity-80" />
          : <ChevronDown className="w-5 h-5 opacity-80" />
        }
      </button>

      {/* Collapsible body */}
      {visible && (
        <div className="divide-y divide-gray-50 animate-fadeIn">
          {topCrops.slice(0, 3).map((item) => {
            const medal  = MEDALS[item.rank - 1] ?? `#${item.rank}`;
            const yield_ =
              item.predicted_yield_kg_per_ha != null
                ? `${item.predicted_yield_kg_per_ha.toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg/ha`
                : 'N/A';

            return (
              <div
                key={item.crop}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl flex-shrink-0">{medal}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.crop}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Tag className="w-3 h-3" /> {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <TrendingUp className="w-3 h-3" /> {yield_}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">Category prob.</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {(item.category_probability * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "View Final Recommendation" CTA when collapsed */}
      {!visible && (
        <div
          className="px-5 py-3 bg-green-50 border-t border-green-100 cursor-pointer group"
          onClick={() => setVisible(true)}
        >
          <p className="text-sm text-green-700 font-medium group-hover:text-green-900 transition-colors text-center">
            View Final Recommendation ↓
          </p>
        </div>
      )}
    </div>
  );
};
