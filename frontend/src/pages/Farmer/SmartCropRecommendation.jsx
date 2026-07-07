import React, { useRef, useState } from 'react';
import { mlService } from '../../services/mlService';
import { RecommendationForm } from '../../components/Farmer/RecommendationForm';
import { CategoryAccordion } from '../../components/Farmer/CategoryAccordion';
import { RecommendationSummary } from '../../components/Farmer/RecommendationSummary';
import {
  LoadingOverlay,
  ErrorState,
  EmptyState,
} from '../../components/Farmer/RecommendationStates';

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
      {loading && <LoadingOverlay />}

      <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '40px' }}>
        
        {/* Page Header */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--gov-border)',
          borderLeft: '4px solid var(--gov-orange)',
          padding: '14px 18px',
          marginBottom: '20px',
        }}>
          <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--gov-navy)' }}>
          Smart Crop Advisory System
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
            Enter your location details to get AI-powered crop category predictions, historical crop suggestions, and expected yield.
          </p>
        </div>

        {/* Input Form */}
        <div className="gov-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <RecommendationForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <ErrorState message={error} onRetry={() => setError('')} />
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Context bar */}
            <div className="gov-alert gov-alert-info">
              <span>
                Results for{' '}
                <strong>{recommendation.district}</strong>,{' '}
                <strong>{recommendation.state}</strong>
                {' · '}
                <strong>{recommendation.season}</strong>
                {' · '}
                <strong>{recommendation.year}</strong>
              </span>
            </div>

            {/* Category Accordions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommendation.categories.map((cat, i) => (
                <CategoryAccordion
                  key={cat.category}
                  category={cat}
                  defaultOpen={i === 0}
                />
              ))}
            </div>

            {/* Final Recommendation Summary */}
            <RecommendationSummary topCrops={recommendation.top_crops} />
          </div>
        )}

        {/* Empty state */}
        {recommendation && !hasResults && !error && (
          <div style={{ marginTop: '24px' }}>
            <EmptyState />
          </div>
        )}

      </div>
    </>
  );
};
