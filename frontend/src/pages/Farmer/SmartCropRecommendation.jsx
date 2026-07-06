import React, { useRef, useState } from 'react';
import { Brain, Layers } from 'lucide-react';

import { mlService } from '../../services/mlService';
import { RecommendationForm } from '../../components/Farmer/RecommendationForm';
import { CategoryAccordion } from '../../components/Farmer/CategoryAccordion';
import { RecommendationSummary } from '../../components/Farmer/RecommendationSummary';
import {
  LoadingOverlay,
  ErrorState,
  EmptyState,
} from '../../components/Farmer/RecommendationStates';

/**
 * SmartCropRecommendation
 * ========================
 * Single-page Intelligent Crop Decision Support workflow:
 *
 *   [Form] → POST /farmer/recommend (Stage 1 + 2 + 3 in one shot)
 *          → [CategoryAccordion] (expand to see crops + yield)
 *          → [RecommendationSummary] (global top-3 collapsed panel)
 *
 * No additional API calls are made after the initial response.
 */
export const SmartCropRecommendation = () => {
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [recommendation, setRecommendation] = useState(null);

  const resultsRef = useRef(null);

  const handleSubmit = async (formData) => {
    setError('');
    setRecommendation(null);
    setLoading(true);

    try {
      const res = await mlService.getRecommendation(formData);
      setRecommendation(res.data);

      // Smooth scroll to results after a brief render tick
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Failed to get recommendation. Please check your inputs and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const hasResults = recommendation && recommendation.categories?.length > 0;

  return (
    <>
      {/* Full-screen loading overlay */}
      {loading && <LoadingOverlay />}

      <div className="max-w-4xl mx-auto space-y-6 pb-12">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-green-600" />
            Smart Crop Recommendation
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Enter your location details to get AI-powered crop category predictions,
            historical crop suggestions, and expected yield — all in one step.
          </p>
        </div>

        {/* ── Input Form ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <RecommendationForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && (
          <ErrorState
            message={error}
            onRetry={() => setError('')}
          />
        )}

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {hasResults && (
          <div ref={resultsRef} className="space-y-5">

            {/* Context bar */}
            <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500">
              <Layers className="w-4 h-4 text-green-600" />
              <span>
                Results for{' '}
                <strong className="text-gray-800">{recommendation.district}</strong>,{' '}
                <strong className="text-gray-800">{recommendation.state}</strong>
                {' · '}
                <strong className="text-gray-800">{recommendation.season}</strong>
                {' · '}
                <strong className="text-gray-800">{recommendation.year}</strong>
              </span>
            </div>

            {/* Category Accordions */}
            <div className="space-y-3">
              {recommendation.categories.map((cat, i) => (
                <CategoryAccordion
                  key={cat.category}
                  category={cat}
                  defaultOpen={i === 0}   // first category pre-opened
                />
              ))}
            </div>

            {/* Final Recommendation Summary */}
            <RecommendationSummary topCrops={recommendation.top_crops} />
          </div>
        )}

        {/* ── Empty state (response came back but had no categories) ──────── */}
        {recommendation && !hasResults && !error && (
          <EmptyState />
        )}

      </div>
    </>
  );
};
