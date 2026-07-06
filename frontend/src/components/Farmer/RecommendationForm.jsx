import React from 'react';
import { useLocation } from '../../hooks/useLocation';
import { Leaf, RefreshCcw, MapPin, CalendarDays, Hash } from 'lucide-react';

const SEASONS = ['Kharif', 'Rabi', 'Summer', 'Whole Year', 'Autumn', 'Winter'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);

const fieldClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ' +
  'disabled:bg-gray-50 disabled:text-gray-500 transition-colors';

/**
 * RecommendationForm
 * Renders the State / District / Season / Year inputs and the submit button.
 * All location data is handled by the useLocation hook internally.
 */
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-green-600" /> State
          </label>
          <select
            value={loc.selectedState}
            onChange={(e) => loc.handleStateChange(e.target.value)}
            disabled={loading || loc.loading}
            required
            className={fieldClass}
          >
            <option value="">Select State</option>
            {loc.states.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-green-600" /> District
          </label>
          <select
            value={loc.selectedDistrict}
            onChange={(e) => loc.handleDistrictChange(e.target.value)}
            disabled={loading || loc.loading || !loc.selectedState}
            required
            className={fieldClass}
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5 text-green-600" /> Season
          </label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            disabled={loading}
            className={fieldClass}
          >
            {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-green-600" /> Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={loading}
            className={fieldClass}
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading || loc.loading || !loc.selectedState || !loc.selectedDistrict}
          className="
            flex items-center gap-2 px-6 py-2.5
            bg-green-600 text-white text-sm font-medium rounded-md
            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 active:scale-95
          "
        >
          {loading
            ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Analysing…</>
            : <><Leaf className="w-4 h-4" /> Get Recommendation</>
          }
        </button>
      </div>
    </form>
  );
};
