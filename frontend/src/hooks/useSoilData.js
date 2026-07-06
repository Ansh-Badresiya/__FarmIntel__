import { useState, useCallback } from 'react';
import { mlService } from '../services/mlService';

export const useSoilData = () => {
  const [soilPreview, setSoilPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSoilPreview = useCallback(async (state, district, season) => {
    if (!state || !district || !season) return;
    
    setLoading(true);
    setError('');
    setSoilPreview(null);
    try {
      const res = await mlService.getSoilDataPreview({ state, district, season });
      setSoilPreview(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to fetch soil data preview');
    } finally {
      setLoading(false);
    }
  }, []);

  const validateManualSoilData = (data) => {
    const errors = {};
    if (data.nitrogen === '' || data.nitrogen < 0 || data.nitrogen > 500) {
      errors.nitrogen = 'Nitrogen must be between 0 and 500';
    }
    if (data.phosphorus === '' || data.phosphorus < 0 || data.phosphorus > 100) {
      errors.phosphorus = 'Phosphorus must be between 0 and 100';
    }
    if (data.potassium === '' || data.potassium < 0 || data.potassium > 500) {
      errors.potassium = 'Potassium must be between 0 and 500';
    }
    if (data.ph === '' || data.ph < 0 || data.ph > 14) {
      errors.ph = 'pH must be between 0 and 14';
    }
    return errors;
  };

  return {
    soilPreview,
    fetchSoilPreview,
    validateManualSoilData,
    loading,
    error,
    clearPreview: () => setSoilPreview(null)
  };
};
