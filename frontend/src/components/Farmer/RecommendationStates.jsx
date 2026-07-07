import React from 'react';

export const LoadingOverlay = ({ message = 'Analysing your farm data...' }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.8)'
  }}>
    <div className="gov-card" style={{ padding: '32px', textAlign: 'center', borderTop: '4px solid var(--gov-orange)' }}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--gov-navy)' }}>Running AI Pipeline</p>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--gov-text-light)' }}>{message}</p>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
        {['Categories', 'Crops', 'Yield'].map((stage, i) => (
          <React.Fragment key={stage}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', background: '#1A7A1A', borderRadius: '50%' }} />
              <span style={{ fontSize: '11px', color: 'var(--gov-text-muted)' }}>{stage}</span>
            </div>
            {i < 2 && <div style={{ width: '24px', height: '1px', background: '#E8E8E8', marginBottom: '16px' }} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="gov-alert gov-alert-error" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', gap: '8px' }}>
      <div>
        <p style={{ margin: '0 0 2px', fontWeight: 700 }}>Something went wrong</p>
        <p style={{ margin: 0, fontSize: '13px' }}>{message}</p>
      </div>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="gov-btn gov-btn-outline" style={{ fontSize: '12px', padding: '4px 10px', borderColor: '#C0392B', color: '#C0392B' }}>
        Try Again
      </button>
    )}
  </div>
);

export const EmptyState = ({ message = 'No recommendations found for this combination. Try a different season or year.' }) => (
  <div style={{
    background: '#F8F8F8', border: '1px dashed var(--gov-border)', padding: '40px',
    textAlign: 'center', color: 'var(--gov-text-light)', fontSize: '13px'
  }}>
    <p style={{ margin: 0 }}>{message}</p>
  </div>
);
