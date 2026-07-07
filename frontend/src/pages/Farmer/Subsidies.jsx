import React, { useEffect, useState } from 'react';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, XCircle, CheckCircle, Info } from 'lucide-react';

export const Subsidies = () => {
  const [allSubsidies, setAllSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('eligible');
  const navigate = useNavigate();

  useEffect(() => {
    const loadSubsidies = async () => {
      try {
        // Fetch ALL subsidies with their eligibility status
        const res = await farmerService.getAllSubsidies();
        setAllSubsidies(res.data);
      } catch (err) {
        setError('Failed to load subsidies.');
      } finally {
        setLoading(false);
      }
    };
    loadSubsidies();
  }, []);

  const handleApply = async (schemeId) => {
    try {
      await farmerService.applySubsidy(schemeId);
      // Navigate to applications page after applying
      navigate('/farmer/applications');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply for subsidy.');
      window.scrollTo(0,0);
    }
  };

  if (loading) return <LoadingSpinner />;

  const eligibleSubsidies = allSubsidies.filter(s => s.is_eligible);
  const displayedSubsidies = activeTab === 'eligible' ? eligibleSubsidies : allSubsidies;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Government Subsidies</h1>
          <p className="text-gray-600 mt-1">Explore and apply for agricultural schemes and benefits.</p>
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'eligible'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Eligible Schemes
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
              {eligibleSubsidies.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Schemes
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
              {allSubsidies.length}
            </span>
          </button>
        </nav>
      </div>

      {/* List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayedSubsidies.map((item) => {
          const { scheme, is_eligible, ineligible_reasons, already_applied, application_status } = item;
          
          return (
            <div key={scheme.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      ₹{scheme.subsidy_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{scheme.scheme_name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{scheme.description}</p>
                
                {/* Status Indicator */}
                {already_applied ? (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium">
                    <Info className="w-5 h-5 shrink-0" />
                    <p>You have already applied for this scheme. Status: <span className="uppercase font-bold">{application_status}</span></p>
                  </div>
                ) : is_eligible ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <CheckCircle className="w-5 h-5" />
                    Eligible for this scheme
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                      <XCircle className="w-5 h-5" />
                      Not Eligible
                    </div>
                    {ineligible_reasons.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-red-500 space-y-1 ml-1">
                        {ineligible_reasons.slice(0, 2).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                        {ineligible_reasons.length > 2 && <li>+ {ineligible_reasons.length - 2} more reasons</li>}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                {already_applied ? (
                  <Link 
                    to="/farmer/applications"
                    className="w-full flex justify-center py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded-xl transition-colors"
                  >
                    View Application
                  </Link>
                ) : is_eligible ? (
                  <button 
                    onClick={() => handleApply(scheme.id)}
                    className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl text-gray-400 bg-gray-100 cursor-not-allowed"
                  >
                    Not Eligible
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {displayedSubsidies.length === 0 && !error && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No schemes found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {activeTab === 'eligible' 
                ? "You are not eligible for any active schemes based on your current profile. Try updating your profile or farm details."
                : "There are currently no active schemes available."}
            </p>
            {activeTab === 'eligible' && (
              <div className="mt-6 flex justify-center gap-4">
                <Link to="/farmer/profile" className="text-sm font-medium text-green-600 hover:text-green-700">Update Profile</Link>
                <Link to="/farmer/farm" className="text-sm font-medium text-green-600 hover:text-green-700">Update Farm Details</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
