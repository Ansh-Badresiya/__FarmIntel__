import React, { useEffect, useState } from 'react';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { Link } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';

export const Subsidies = () => {
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSubsidies = async () => {
      try {
        const res = await farmerService.getSubsidies();
        setSubsidies(res.data);
      } catch (err) {
        setError('Failed to load eligible subsidies.');
      } finally {
        setLoading(false);
      }
    };
    loadSubsidies();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Eligible Subsidies</h1>
        <p className="text-gray-600">Based on your profile, you may be eligible for the following schemes.</p>
      </div>

      <ErrorAlert message={error} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subsidies.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <Shield className="text-green-600 w-8 h-8" />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ₹{scheme.subsidy_amount.toLocaleString()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{scheme.scheme_name}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{scheme.description}</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
              <Link 
                to={`/farmer/apply/${scheme.id}`}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Apply Now <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}

        {subsidies.length === 0 && !error && (
          <div className="col-span-full p-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No subsidies found at this time. Please ensure your profile and farm details are complete.</p>
          </div>
        )}
      </div>
    </div>
  );
};
