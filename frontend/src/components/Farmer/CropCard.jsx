import React from 'react';

export const CropCard = ({ crop }) => {
  const RANK_MEDALS = ['🥇', '🥈', '🥉'];
  const medal = RANK_MEDALS[crop.rank - 1] ?? `#${crop.rank}`;

  const yieldDisplay =
    crop.predicted_yield_kg_per_ha != null
      ? `${crop.predicted_yield_kg_per_ha.toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg/ha`
      : 'N/A';

  return (
    <div className="gov-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Crop Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--gov-border)', paddingBottom: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>{medal}</span>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>{crop.crop}</h4>
      </div>

      {/* Metrics Vertical Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {/* Yield */}
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--gov-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Expected Yield</p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1A7A1A' }}>{yieldDisplay}</p>
        </div>

        {/* Historical Probability */}
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--gov-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Historical Probability</p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1A5C9C' }}>
            {(crop.probability * 100).toFixed(1)}%
          </p>
        </div>

        {/* Frequency */}
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--gov-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Historical Frequency</p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--gov-orange)' }}>
            {crop.frequency.toLocaleString('en-IN')} Records
          </p>
        </div>
      </div>
    </div>
  );
};
