import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { farmerService } from '../../services/farmerService';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { FileUp, Info } from 'lucide-react';

export const ApplySubsidy = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      await farmerService.applySubsidy(schemeId);
      navigate('/farmer/applications');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Application Form</h2>
            <p className="text-sm text-gray-500">Submit your details for the subsidy scheme.</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Please ensure your profile and farm details are completely filled out before applying. 
              The approval process relies on accurate base information.
            </p>
          </div>

          <ErrorAlert message={error} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="border border-dashed border-gray-300 rounded-lg p-6">
              <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <FileUp className="w-5 h-5 mr-2 text-gray-400" />
                Required Documents
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Land Proof (7/12 Extract, etc.)</label>
                  <input
                    type="file"
                    {...register('land_proof', { required: 'Land proof is required' })}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                  />
                  {errors.land_proof && <p className="mt-1 text-sm text-red-600">{errors.land_proof.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Identity Proof (Aadhar/PAN)</label>
                  <input
                    type="file"
                    {...register('identity_proof', { required: 'Identity proof is required' })}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                  />
                  {errors.identity_proof && <p className="mt-1 text-sm text-red-600">{errors.identity_proof.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate('/farmer/subsidies')}
                className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
