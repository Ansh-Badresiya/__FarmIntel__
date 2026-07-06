import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { CropCard } from './CropCard';

const RANK_MEDALS  = ['🥇', '🥈', '🥉'];
const RANK_COLOURS = [
  { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', prob: 'text-yellow-700' },
  { bg: 'bg-gray-50',   border: 'border-gray-200',   badge: 'bg-gray-100   text-gray-700',   prob: 'text-gray-700'   },
  { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', prob: 'text-orange-700' },
];

/**
 * CategoryAccordion — shows a category card with probability + expand/collapse.
 *
 * Props:
 *   category: {
 *     rank, category, probability, lookup_scope, crops: [...]
 *   }
 *   defaultOpen: boolean
 */
export const CategoryAccordion = ({ category, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  const idx     = Math.min(category.rank - 1, 2);
  const medal   = RANK_MEDALS[idx] ?? `#${category.rank}`;
  const colours = RANK_COLOURS[idx] ?? RANK_COLOURS[2];
  const pct     = (category.probability * 100).toFixed(1);

  // Progress bar width clamped to 100%
  const barWidth = Math.min(category.probability * 100, 100);

  return (
    <div className={`
      rounded-xl border ${colours.border} ${colours.bg}
      overflow-hidden shadow-sm
      transition-all duration-200 hover:shadow-md
    `}>
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 text-left group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{medal}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-base">{category.category}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colours.badge}`}>
                {pct}% probability
              </span>
              {category.lookup_scope === 'state' && (
                <span className="text-xs text-gray-400 italic">(state-level data)</span>
              )}
            </div>
            {/* Probability bar */}
            <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-700"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <span className="text-xs text-gray-500 hidden sm:block">
            {open ? 'Hide crops' : 'View crops'}
          </span>
          {open
            ? <ChevronUp  className="w-5 h-5 text-gray-500 group-hover:text-green-600 transition-colors" />
            : <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-green-600 transition-colors" />
          }
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-5 pb-5 border-t border-white/50 animate-fadeIn">
          {category.crops.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
              <Layers className="w-4 h-4" />
              No crop data found for this combination.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {category.crops.map((crop) => (
                <CropCard key={crop.crop} crop={crop} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
