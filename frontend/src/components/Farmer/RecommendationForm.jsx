import React from 'react';
import { useLocation } from '../../hooks/useLocation';

const SEASONS = ['Kharif', 'Rabi', 'Summer', 'Whole Year', 'Autumn', 'Winter'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);

export const RecommendationForm = ({ onSubmit, loading }) => {
  const loc = useLocation();

  const [season, setSeason] = React.useState('Kharif');
  const [year, setYear] = React.useState(CURRENT_YEAR);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loc.selectedState) return;
    if (!loc.selectedDistrict) return;
    onSubmit({
      state:    loc.selectedState,
      district: loc.selectedDistrict,
      season,
      year: Number(year),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* State */}
        <div>
          <label className="gov-label">State <span style={{ color: '#C0392B' }}>*</span></label>
          <select
            value={loc.selectedState}
            onChange={(e) => loc.handleStateChange(e.target.value)}
            disabled={loading || loc.loading}
            required
            className="gov-input"
          >
            <option value="">Select State</option>
            {loc.states.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="gov-label">District <span style={{ color: '#C0392B' }}>*</span></label>
          <select
            value={loc.selectedDistrict}
            onChange={(e) => loc.handleDistrictChange(e.target.value)}
            disabled={loading || loc.loading || !loc.selectedState}
            required
            className="gov-input"
          >
            <option value="">
              {!loc.selectedState ? 'Select a state first' : 'Select District'}
            </option>
            {loc.districts.map((d) => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

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
          disabled={loading || loc.loading || !loc.selectedState || !loc.selectedDistrict}
          className="gov-btn gov-btn-primary"
        >
          {loading ? 'Analysing Data...' : 'Get Recommendation'}
        </button>
      </div>
    </form>
  );
};
