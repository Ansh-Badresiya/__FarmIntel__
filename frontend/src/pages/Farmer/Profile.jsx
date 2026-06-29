import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

export const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exists, setExists] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await farmerService.getProfile();
        if (res.data) {
          reset(res.data);
          setExists(true);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Failed to load profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await farmerService.updateProfile(data);
      setSuccess('Profile saved successfully!');
      setExists(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-900">Farmer Profile</h2>
          <p className="text-sm text-gray-500">Manage your personal and contact details.</p>
        </div>
        
        <div className="p-6">
          <ErrorAlert message={error} />
          {success && (
            <div className="mb-4 p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
              <input
                type="text"
                {...register('aadhar_number', { 
                  required: 'Aadhar is required',
                  pattern: { value: /^\d{12}$/, message: 'Must be a 12 digit number' }
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="123456789012"
              />
              {errors.aadhar_number && <p className="mt-1 text-sm text-red-600">{errors.aadhar_number.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                {...register('phone_number', { required: 'Phone is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="+91..."
              />
              {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                {...register('address', { required: 'Address is required' })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700">District</label>
                <input
                  type="text"
                  {...register('district', { required: 'District is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
                {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (exists ? 'Update Profile' : 'Create Profile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
