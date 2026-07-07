import React, { useState } from 'react';
import { CropCard } from './CropCard';

const RANK_MEDALS  = ['🥇', '🥈', '🥉'];
const RANK_COLOURS = [
  { border: '#1A7A1A', bg: '#F2F8F2', bar: '#1A7A1A' }, // Goldish / Green
  { border: '#1A5C9C', bg: '#F2F6F9', bar: '#1A5C9C' }, // Silverish / Navy
  { border: '#B8860B', bg: '#FDFBF4', bar: '#B8860B' }, // Bronze / Amber
];

export const CategoryAccordion = ({ category, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  const idx     = Math.min(category.rank - 1, 2);
  const medal   = RANK_MEDALS[idx] ?? `#${category.rank}`;
  const colours = RANK_COLOURS[idx] ?? { border: 'var(--gov-border)', bg: '#fff', bar: 'var(--gov-navy)' };
  const pct     = (category.probability * 100).toFixed(1);

  const barWidth = Math.min(category.probability * 100, 100);

  return (
    <div className="gov-card" style={{ borderLeft: `4px solid ${colours.border}`, background: colours.bg, marginBottom: '8px' }}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '24px', flexShrink: 0 }}>{medal}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--gov-navy)' }}>{category.category}</h3>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#fff', border: `1px solid ${colours.border}`, color: colours.border, padding: '2px 6px', borderRadius: '2px' }}>
                {pct}% probability
              </span>
              {category.lookup_scope === 'state' && (
                <span style={{ fontSize: '11px', color: 'var(--gov-text-muted)', fontStyle: 'italic' }}>(state-level data)</span>
              )}
            </div>
            
            {/* Probability bar */}
            <div style={{ marginTop: '8px', height: '4px', background: '#E8E8E8', width: '100%' }}>
              <div style={{ height: '100%', background: colours.bar, width: `${barWidth}%`, transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', color: 'var(--gov-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
            {open ? 'Hide Crops' : 'View Crops'}
          </span>
          <span style={{ fontSize: '14px', color: 'var(--gov-text-muted)' }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
          {category.crops.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--gov-text-muted)', fontStyle: 'italic' }}>
              No crop data found for this combination.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
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
