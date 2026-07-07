import React, { useState } from 'react';

const MEDALS = ['🥇', '🥈', '🥉'];

export const RecommendationSummary = ({ topCrops }) => {
  const [visible, setVisible] = useState(false);

  if (!topCrops || topCrops.length === 0) return null;

  return (
    <div className="gov-card" style={{ overflow: 'hidden', marginBottom: '20px' }}>
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: 'var(--gov-navy)', borderBottom: visible ? '2px solid var(--gov-orange)' : 'none',
          border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#132B45'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--gov-navy)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Top Recommended Crops
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              Overall best crops ranked across all categories
            </p>
          </div>
        </div>
        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
          {visible ? '▲' : '▼'}
        </span>
      </button>

      {/* Collapsible body */}
      {visible && (
        <div style={{ padding: 0 }}>
          {topCrops.slice(0, 3).map((item, i) => {
            const medal  = MEDALS[item.rank - 1] ?? `#${item.rank}`;
            const yield_ =
              item.predicted_yield_kg_per_ha != null
                ? `${item.predicted_yield_kg_per_ha.toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg/ha`
                : 'N/A';

            return (
              <div
                key={item.crop}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                  borderBottom: i < 2 ? '1px solid #E8E8E8' : 'none', transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8F8F8'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '28px', flexShrink: 0 }}>{medal}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: 'var(--gov-navy)' }}>{item.crop}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--gov-text-muted)' }}>
                      Category: {item.category}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A7A1A' }}>
                      Yield: {yield_}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--gov-text-light)', textTransform: 'uppercase' }}>Category Prob.</p>
                  <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '15px', color: 'var(--gov-navy)' }}>
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
          onClick={() => setVisible(true)}
          style={{
            padding: '12px', background: '#F8F8F8', borderTop: '1px solid var(--gov-border)',
            cursor: 'pointer', textAlign: 'center', transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
          onMouseLeave={e => e.currentTarget.style.background = '#F8F8F8'}
        >
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--gov-navy)' }}>
            View Final Recommendation ↓
          </p>
        </div>
      )}
    </div>
  );
};
