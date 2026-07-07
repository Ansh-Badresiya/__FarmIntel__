import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { farmerService } from '../../services/farmerService';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { User, MapPin, Briefcase, CreditCard, ChevronRight } from 'lucide-react';

import { INDIA_STATES_DISTRICTS } from '../../utils/indiaStatesDistricts';

const INDIAN_STATES = INDIA_STATES_DISTRICTS.states.map(s => s.state);

const SectionHeader = ({ icon: Icon, title, desc }) => (
  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
    <div className="p-2 bg-green-50 rounded-lg text-green-600">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </div>
);

export const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exists, setExists] = useState(false);
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || ''
    }
  });

  const dob = watch('date_of_birth');
  const selectedState = watch('state');

  const availableDistricts = INDIA_STATES_DISTRICTS.states.find(s => s.state === selectedState)?.districts || [];

  // Auto-calculate age from DOB
  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setValue('age', age);
    }
  }, [dob, setValue]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await farmerService.getProfile();
        if (res.data) {
          // Merge user details (which are not saved in profile table but useful for display)
          reset({ ...res.data, full_name: user?.full_name, email: user?.email });
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
  }, [reset, user]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Remove fields that are not in FarmerBase schema
      const { full_name, email, ...submitData } = data;
      await farmerService.updateProfile(submitData);
      setSuccess('Profile saved successfully!');
      setExists(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Farmer Profile</h1>
        <p className="text-gray-500 mt-1">Complete your profile to check eligibility for government schemes.</p>
      </div>

      <ErrorAlert message={error} />
      {success && (
        <div className="p-4 text-sm font-medium text-green-800 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* SECTION 1: Personal Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <SectionHeader icon={User} title="Personal Details" desc="Your identity and contact information" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" {...register('full_name')} disabled className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Synced from your account settings</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
              <input type="text" {...register('father_name')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="Father's full name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select {...register('gender')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" {...register('date_of_birth')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input type="number" {...register('age')} readOnly className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select {...register('category')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input type="text" {...register('phone_number', { required: 'Phone is required' })} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="+91" />
              {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number <span className="text-red-500">*</span></label>
              <input type="text" {...register('aadhar_number', { required: 'Aadhaar is required', pattern: { value: /^\d{12}$/, message: 'Must be a 12 digit number' }})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="12-digit number" />
              {errors.aadhar_number && <p className="mt-1 text-xs text-red-500">{errors.aadhar_number.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input type="text" {...register('pan_number')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors uppercase" placeholder="ABCDE1234F" />
            </div>
          </div>
        </div>

        {/* SECTION 2: Address */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <SectionHeader icon={MapPin} title="Address Details" desc="Your permanent residence" />
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <textarea {...register('address')} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="House no, Street name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village/Town</label>
                <input type="text" {...register('village')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taluka/Tehsil</label>
                <input type="text" {...register('taluka')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select {...register('state')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select {...register('district')} disabled={!selectedState} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400">
                  <option value="">Select District</option>
                  {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <input type="text" {...register('postal_code')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Socio-Economic */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <SectionHeader icon={Briefcase} title="Socio-Economic Profile" desc="Required for scheme eligibility criteria" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Type</label>
              <select {...register('farmer_type')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select Type</option>
                <option value="Marginal">Marginal (up to 1 hectare)</option>
                <option value="Small">Small (1 to 2 hectares)</option>
                <option value="Medium">Medium (2 to 10 hectares)</option>
                <option value="Large">Large (more than 10 hectares)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land Ownership</label>
              <select {...register('land_ownership')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select Ownership</option>
                <option value="Owned">Owned</option>
                <option value="Leased">Leased/Tenant</option>
                <option value="Joint">Joint/Shared</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (₹)</label>
              <input type="number" {...register('annual_income', { valueAsNumber: true })} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="e.g. 150000" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
              <select {...register('education')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select Education</option>
                <option value="None">None</option>
                <option value="Primary">Primary (Up to 5th)</option>
                <option value="Secondary">Secondary (Up to 10th)</option>
                <option value="Higher Secondary">Higher Secondary (12th)</option>
                <option value="Graduate">Graduate & Above</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Occupation</label>
              <input type="text" {...register('occupation')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="e.g. Agriculture" />
            </div>
          </div>
        </div>

        {/* SECTION 4: Bank Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <SectionHeader icon={CreditCard} title="Bank Details" desc="For Direct Benefit Transfer (DBT)" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
              <input type="password" {...register('bank_account_number')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors font-mono" placeholder="••••••••••••" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <input type="text" {...register('ifsc_code')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors uppercase font-mono" placeholder="SBIN0001234" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : (exists ? 'Update Profile' : 'Save Profile')}
            {!saving && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
