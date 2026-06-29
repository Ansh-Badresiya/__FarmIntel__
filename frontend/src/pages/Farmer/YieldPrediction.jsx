import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { mlService } from '../../services/mlService';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { Sprout, RefreshCcw } from 'lucide-react';

export const YieldPrediction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await mlService.predictYield(data);
      setResult(res.data);
    } catch (err) {
      setError('Failed to get yield prediction. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Yield Prediction</h1>
        <p className="text-gray-600">Estimate your harvest based on historical data and current parameters.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <ErrorAlert message={error} />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Crop</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rice, Wheat"
                  {...register('crop', { required: 'Crop is required' })} 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" 
                />
                {errors.crop && <p className="mt-1 text-sm text-red-600">{errors.crop.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Season</label>
                <select 
                  {...register('season', { required: 'Season is required' })} 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="">Select season...</option>
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Zaid">Zaid</option>
                  <option value="Whole Year">Whole Year</option>
                </select>
                {errors.season && <p className="mt-1 text-sm text-red-600">{errors.season.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input 
                  type="text" 
                  {...register('state', { required: 'State is required' })} 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" 
                />
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Area (Hectares)</label>
                <input 
                  type="number" 
                  step="0.01"
                  {...register('area', { required: 'Area is required', valueAsNumber: true })} 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" 
                />
                {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>}
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              >
                {loading ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Sprout className="w-4 h-4 mr-2" />}
                Predict Yield
              </button>
            </div>
          </form>
        </div>
      </div>

      {result && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center animate-fade-in">
          <p className="text-amber-800 font-medium mb-1">Estimated Yield</p>
          <div className="flex items-end justify-center gap-2">
            <h2 className="text-4xl font-bold text-amber-700">{result.predicted_yield}</h2>
            <span className="text-amber-600 font-medium pb-1">{result.unit}</span>
          </div>
        </div>
      )}
    </div>
  );
};
