import React, { useEffect } from 'react';
import { useLocation } from '../../hooks/useLocation';

export const LocationSelector = ({
  value = { state: '', district: '', village: '' },
  onChange,
  showVillage = true,
  disabled = false,
  required = false,
  errors = {}
}) => {
  const loc = useLocation(value.state, value.district, value.village);

  // Sync upstream when internal state changes
  useEffect(() => {
    if (value.state !== loc.selectedState || 
        value.district !== loc.selectedDistrict || 
        (showVillage && value.village !== loc.selectedVillage)) {
      onChange({
        state: loc.selectedState,
        district: loc.selectedDistrict,
        village: loc.selectedVillage
      });
    }
  }, [loc.selectedState, loc.selectedDistrict, loc.selectedVillage, onChange, value.state, value.district, value.village, showVillage]);

  // Sync internal state when upstream value changes externally
  useEffect(() => {
    if (value.state && value.state !== loc.selectedState) loc.setSelectedState(value.state);
    if (value.district && value.district !== loc.selectedDistrict) loc.setSelectedDistrict(value.district);
    if (showVillage && value.village && value.village !== loc.selectedVillage) loc.setSelectedVillage(value.village);
  }, [value, loc.selectedState, loc.selectedDistrict, loc.selectedVillage, loc, showVillage]);

  return (
    <>
      <div>
        <label className="gov-label">
          State {required && <span style={{ color: '#C0392B' }}>*</span>}
        </label>
        <select
          value={loc.selectedState}
          onChange={(e) => loc.handleStateChange(e.target.value)}
          disabled={disabled || loc.loading}
          className="gov-input"
          required={required}
        >
          <option value="">-- Select State --</option>
          {loc.states.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
        {errors.state && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.state}</p>}
      </div>

      <div>
        <label className="gov-label">
          District {required && <span style={{ color: '#C0392B' }}>*</span>}
        </label>
        <select
          value={loc.selectedDistrict}
          onChange={(e) => loc.handleDistrictChange(e.target.value)}
          disabled={disabled || loc.loading || !loc.selectedState}
          className="gov-input"
          required={required}
        >
          <option value="">
            {!loc.selectedState ? '-- Select a State first --' : '-- Select District --'}
          </option>
          {loc.districts.map((d) => (
            <option key={d.name} value={d.name}>{d.name}</option>
          ))}
        </select>
        {errors.district && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.district}</p>}
      </div>

      {showVillage && (
        <div>
          <label className="gov-label">
            Village / Town {required && <span style={{ color: '#C0392B' }}>*</span>}
          </label>
          <input
            type="text"
            value={loc.selectedVillage}
            onChange={(e) => loc.handleVillageChange(e.target.value)}
            disabled={disabled}
            className="gov-input"
            required={required}
            placeholder="Enter village or town name"
          />
          {errors.village && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.village}</p>}
        </div>
      )}
    </>
  );
};
