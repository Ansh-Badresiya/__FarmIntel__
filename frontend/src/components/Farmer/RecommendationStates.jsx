import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingOverlay — full-page translucent overlay with animated spinner and status text.
 *
 * Props:
 *   message?: string   optional status line beneath the spinner
 */
export const LoadingOverlay = ({ message = 'Analysing your farm data…' }) => (
  <div className="
    fixed inset-0 z-50
    flex flex-col items-center justify-center
    bg-white/80 backdrop-blur-sm
  ">
    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        <div className="absolute inset-0 rounded-full border-2 border-green-100 animate-ping opacity-40" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-900">Running AI Pipeline</p>
        <p className="text-sm text-gray-500 mt-1">{message}</p>
      </div>
      {/* Stage indicators */}
      <div className="flex items-center gap-2 mt-2">
        {['Categories', 'Crops', 'Yield'].map((stage, i) => (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              <span className="text-xs text-gray-400">{stage}</span>
            </div>
            {i < 2 && <div className="w-6 h-px bg-gray-200 mb-4" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

/**
 * ErrorState — card displayed when the API call fails.
 *
 * Props:
 *   message: string
 *   onRetry?: () => void
 */
export const ErrorState = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
    <p className="text-red-800 font-medium mb-1">Something went wrong</p>
    <p className="text-sm text-red-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

/**
 * EmptyState — shown when Stage 2 returns no crops.
 */
export const EmptyState = ({ message = 'No recommendations found for this combination. Try a different season or year.' }) => (
  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-10 text-center">
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
);
