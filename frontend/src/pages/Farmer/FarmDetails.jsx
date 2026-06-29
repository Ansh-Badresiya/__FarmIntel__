import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

export const FarmDetails = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exists, setExists] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const loadFarm = async () => {
      try {
        const res = await farmerService.getFarm();
        if (res.data) {
          reset(res.data);
          setExists(true);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Failed to load farm details.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadFarm();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (exists) {
        await farmerService.updateFarm(data);
      } else {
        await farmerService.createFarm(data);
      }
      setSuccess('Farm details saved successfully!');
      setExists(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save farm details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-900">Farm Details</h2>
          <p className="text-sm text-gray-500">Keep your land and soil information up to date.</p>
        </div>
        
        <div className="p-6">
          <ErrorAlert message={error} />
          {success && (
            <div className="mb-4 p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Land Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Land Area (Hectares)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  step="0.01"
                  {...register('land_area', { required: 'Land area is required', valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 pr-24"
                  placeholder="e.g. 2.5"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Hectares</span>
                </div>
              </div>
              {errors.land_area && <p className="mt-1 text-sm text-red-600">{errors.land_area.message}</p>}
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Soil Type</label>
              <input
                type="text"
                {...register('soil_type')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="e.g. Alluvial, Black, Red, Laterite"
              />
            </div>

            {/* Water Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Water Source / Irrigation</label>
              <select
                {...register('water_source')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="">Select source...</option>
                <option value="Rainfed">Rainfed</option>
                <option value="Canal">Canal Irrigation</option>
                <option value="Tubewell">Tubewell / Borewell</option>
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="River">River / Pond</option>
              </select>
            </div>

            {/* Ownership Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Land Ownership</label>
              <select
                {...register('ownership_type')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="">Select type...</option>
                <option value="Owned">Owned</option>
                <option value="Leased">Leased</option>
                <option value="Shared">Shared / Joint</option>
              </select>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (exists ? 'Update Farm' : 'Save Farm')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
