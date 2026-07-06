import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/locationService';

export const useLocation = (initialState = '', initialDistrict = '', initialVillage = '') => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedVillage, setSelectedVillage] = useState(initialVillage);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch States on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true);
        const res = await locationService.getStates();
        setStates(res.data.states || []);
      } catch (err) {
        console.error("Failed to fetch states", err);
        setError('Failed to fetch location data');
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, []);

  // Fetch Districts when selectedState changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        const res = await locationService.getDistricts(selectedState);
        setDistricts(res.data.districts || []);
      } catch (err) {
        console.error("Failed to fetch districts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // Fetch Villages when selectedDistrict changes
  useEffect(() => {
    if (!selectedDistrict) {
      setVillages([]);
      return;
    }
    const fetchVillages = async () => {
      try {
        setLoading(true);
        const res = await locationService.getVillages(selectedDistrict);
        setVillages(res.data.villages || []);
      } catch (err) {
        console.error("Failed to fetch villages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVillages();
  }, [selectedDistrict]);

  const handleStateChange = useCallback((newState) => {
    setSelectedState(newState);
    setSelectedDistrict('');
    setSelectedVillage('');
  }, []);

  const handleDistrictChange = useCallback((newDistrict) => {
    setSelectedDistrict(newDistrict);
    setSelectedVillage('');
  }, []);

  const handleVillageChange = useCallback((newVillage) => {
    setSelectedVillage(newVillage);
  }, []);

  return {
    states,
    districts,
    villages,
    selectedState,
    selectedDistrict,
    selectedVillage,
    handleStateChange,
    handleDistrictChange,
    handleVillageChange,
    setSelectedState,
    setSelectedDistrict,
    setSelectedVillage,
    loading,
    error
  };
};
