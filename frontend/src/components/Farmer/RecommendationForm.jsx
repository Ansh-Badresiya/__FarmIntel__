import React from 'react';
import { LocationSelector } from '../../components/shared/LocationSelector';

const SEASONS = ['Kharif', 'Rabi', 'Summer', 'Whole Year', 'Autumn', 'Winter'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);

export const RecommendationForm = ({ onSubmit, loading }) => {
  const [locValue, setLocValue] = React.useState({ state: '', district: '', village: '' });

  const [season, setSeason] = React.useState('Kharif');
  const [year, setYear] = React.useState(CURRENT_YEAR);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!locValue.state) return;
    if (!locValue.district) return;
    onSubmit({
      state:    locValue.state,
      district: locValue.district,
      season,
      year: Number(year),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* State */}
        <LocationSelector 
          value={locValue}
          onChange={setLocValue}
          showVillage={false}
          required={true}
          disabled={loading}
        />

        {/* Season */}
        <div>
          <label className="gov-label">Season <span style={{ color: '#C0392B' }}>*</span></label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            disabled={loading}
            className="gov-input"
          >
            {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="gov-label">Year <span style={{ color: '#C0392B' }}>*</span></label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={loading}
            className="gov-input"
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--gov-border)', paddingTop: '16px' }}>
        <button
          type="submit"
          disabled={loading || !locValue.state || !locValue.district}
          className="gov-btn gov-btn-primary"
        >
          {loading ? 'Analysing Data...' : 'Get Recommendation'}
        </button>
      </div>
    </form>
  );
};
