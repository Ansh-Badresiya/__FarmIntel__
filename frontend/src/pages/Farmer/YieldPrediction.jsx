import React, { useState, useEffect } from 'react';
import { useLocation } from '../../hooks/useLocation';
import { mlService } from '../../services/mlService';
import { cropService } from '../../services/cropService';
import { LocationSelect } from '../../components/Farmer/LocationSelect';
import { YieldPredictionResult } from '../../components/Farmer/YieldPredictionResult';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { TrendingUp, RefreshCcw } from 'lucide-react';

export const YieldPrediction = () => {
  const [profileData, setProfileData] = useState(null);
  
  const [crops, setCrops] = useState([]);
  const [irrigationTypes, setIrrigationTypes] = useState([]);
  
  const [selectedCrop, setSelectedCrop] = useState('');
  const [season, setSeason] = useState('Kharif');
  const [irrigation, setIrrigation] = useState('');
  const [area, setArea] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const loc = useLocation();

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [profRes, cropRes, irrigRes] = await Promise.all([
          mlService.getCropInputData(),
          cropService.getCrops(),
          cropService.getIrrigationTypes()
        ]);
        
        const profile = profRes.data.profile;
        setProfileData(profile);
        setSeason(profRes.data.current_season || 'Kharif');
        setCrops(cropRes.data.crops || []);
        setIrrigationTypes(irrigRes.data.irrigation_types || []);
        
        if (profile && profile.state) {
          loc.setSelectedState(profile.state);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchInitData();
  }, []);

  // Update crops when season changes
  useEffect(() => {
    const fetchSeasonCrops = async () => {
      try {
        const res = await cropService.getCropsBySeason(season);
        setCrops(res.data.crops || []);
        setSelectedCrop('');
      } catch (err) {}
    };
    fetchSeasonCrops();
  }, [season]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!selectedCrop) {
      setError('Please select a crop.');
      return;
    }
    if (!area || area <= 0) {
      setError('Please enter a valid area in hectares.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        crop: selectedCrop,
        season,
        state: loc.selectedState,
        area: Number(area),
        irrigation_type: irrigation
      };
      
      const res = await mlService.predictYield(payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to predict yield.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" /> Yield Prediction
        </h1>
        <p className="text-gray-600">Estimate your potential crop yield based on regional data and farm details.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <ErrorAlert message={error} />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Location */}
            <div>
              <h3 className="font-medium text-gray-900 border-b pb-2 mb-4">Location Details</h3>
              <LocationSelect 
                states={loc.states}
                selectedState={loc.selectedState}
                onStateChange={loc.handleStateChange}
                disabled={loading}
              />
            </div>

            {/* Farm Details */}
            <div>
              <h3 className="font-medium text-gray-900 border-b pb-2 mb-4">Crop & Farm Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Crop</option>
                    {crops.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    disabled={loading}
                    placeholder="e.g. 2.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Type</label>
                  <select
                    value={irrigation}
                    onChange={(e) => setIrrigation(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Irrigation Method</option>
                    {irrigationTypes.map(i => (
                      <option key={i.id} value={i.name}>{i.name}</option>
                    ))}
                  </select>
                </div>
                
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading || loc.loading}
                className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                Predict Yield
              </button>
            </div>
          </form>
        </div>
      </div>

      <YieldPredictionResult result={result} />
      
    </div>
  );
};
