import React, { useState, useEffect } from 'react';
import { useLocation } from '../../hooks/useLocation';
import { useSoilData } from '../../hooks/useSoilData';
import { mlService } from '../../services/mlService';
import { LocationSelect } from '../../components/Farmer/LocationSelect';
import { SoilDataSource } from '../../components/Farmer/SoilDataSource';
import { SoilInputFields } from '../../components/Farmer/SoilInputFields';
import { CropRecommendationResult } from '../../components/Farmer/CropRecommendationResult';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { Leaf, RefreshCcw } from 'lucide-react';

export const CropRecommendation = () => {
  const [profileData, setProfileData] = useState(null);
  const [season, setSeason] = useState('Kharif');
  const [soilSource, setSoilSource] = useState('auto');
  const [manualValues, setManualValues] = useState({ nitrogen: '', phosphorus: '', potassium: '', ph: '' });
  const [manualErrors, setManualErrors] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const loc = useLocation();
  const soil = useSoilData();

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const res = await mlService.getCropInputData();
        const profile = res.data.profile;
        setProfileData(profile);
        setSeason(res.data.current_season || 'Kharif');
        
        if (profile) {
          if (profile.state) loc.setSelectedState(profile.state);
          // Small delay might be needed for real apps due to cascading, but hooks will handle the fetches
        }
      } catch (err) {
        console.error("Failed to fetch initial profile data", err);
      }
    };
    fetchInitData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validate
    if (!loc.selectedState) {
      setError('Please select a State.');
      return;
    }

    if (soilSource === 'manual') {
      const errs = soil.validateManualSoilData(manualValues);
      if (Object.keys(errs).length > 0) {
        setManualErrors(errs);
        setError('Please fix the errors in manual soil entry.');
        return;
      }
      setManualErrors({});
    }

    setLoading(true);
    try {
      const payload = {
        state: loc.selectedState,
        season,
        soil_source: soilSource,
        ...(soilSource === 'manual' ? manualValues : {})
      };
      
      const res = await mlService.predictCrop(payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get crop recommendation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Leaf className="w-6 h-6 mr-2 text-green-600" /> Crop Recommendation
        </h1>
        <p className="text-gray-600">Enter your location and soil data to get AI-powered crop suggestions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <ErrorAlert message={error} />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Location & Season */}
            <div>
              <h3 className="font-medium text-gray-900 border-b pb-2 mb-4">Step 1: Location & Season</h3>
              <LocationSelect 
                states={loc.states}
                selectedState={loc.selectedState}
                onStateChange={loc.handleStateChange}
                disabled={loading}
              />
              
              <div className="mt-4 md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
            </div>

            {/* Step 2: Soil Data Source */}
            <div>
              <SoilDataSource 
                source={soilSource}
                onSourceChange={setSoilSource}
                disabled={loading}
              />
              
              {soilSource === 'manual' && (
                <div className="animate-fade-in">
                  <SoilInputFields 
                    values={manualValues}
                    onChange={setManualValues}
                    errors={manualErrors}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading || loc.loading}
                className="flex items-center px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
              >
                {loading ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Leaf className="w-4 h-4 mr-2" />}
                Get Recommendation
              </button>
            </div>
          </form>
        </div>
      </div>

      <CropRecommendationResult result={result} />
      
    </div>
  );
};
