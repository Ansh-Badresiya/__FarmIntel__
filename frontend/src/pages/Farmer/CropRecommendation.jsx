import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { mlService } from '../../services/mlService';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { Leaf, RefreshCcw } from 'lucide-react';

export const CropRecommendation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await mlService.predictCrop(data);
      setResult(res.data);
    } catch (err) {
      setError('Failed to get crop recommendation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crop Recommendation</h1>
        <p className="text-gray-600">Enter your soil and climate data to get AI-powered crop suggestions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <ErrorAlert message={error} />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Soil Nutrients */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Soil Nutrients</h3>
                <div>
                  <label className="block text-sm text-gray-700">Nitrogen (N)</label>
                  <input type="number" {...register('N', { required: true })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Phosphorous (P)</label>
                  <input type="number" {...register('P', { required: true })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Potassium (K)</label>
                  <input type="number" {...register('K', { required: true })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>

              {/* Climate */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Climate</h3>
                <div>
                  <label className="block text-sm text-gray-700">Temperature (°C)</label>
                  <input type="number" step="0.1" {...register('temperature', { required: true })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Humidity (%)</label>
                  <input type="number" step="0.1" {...register('humidity', { required: true })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Rainfall (mm)</label>
                  <input type="number" step="0.1" {...register('rainfall', { required: true })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>

              {/* Soil Properties */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Properties</h3>
                <div>
                  <label className="block text-sm text-gray-700">pH Level</label>
                  <input type="number" step="0.1" {...register('ph', { required: true })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Leaf className="w-4 h-4 mr-2" />}
                Get Recommendation
              </button>
            </div>
          </form>
        </div>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in">
          <p className="text-green-800 font-medium mb-1">Recommended Crop</p>
          <h2 className="text-4xl font-bold text-green-700 capitalize">{result.recommendation}</h2>
          {result.confidence && (
            <p className="text-green-600 text-sm mt-2">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
          )}
        </div>
      )}
    </div>
  );
};
