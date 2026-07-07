import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { Map, Droplets, Leaf, Tractor, ChevronRight } from 'lucide-react';

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save farm details.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Farm Details</h1>
        <p className="text-gray-500 mt-1">Provide comprehensive details about your agricultural land and practices.</p>
      </div>

      <ErrorAlert message={error} />
      {success && (
        <div className="p-4 text-sm font-medium text-green-800 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* SECTION 1: Land Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <SectionHeader icon={Map} title="Land Record Details" desc="Official land identifiers and ownership" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khata / Khasra Number</label>
              <input type="text" {...register('khata_number')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="Land record number" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land Area (Hectares) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" {...register('land_area', { required: 'Land area is required', valueAsNumber: true })} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="e.g. 2.5" />
              {errors.land_area && <p className="mt-1 text-xs text-red-500">{errors.land_area.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Type</label>
              <select {...register('ownership_type')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select type</option>
                <option value="Owned">Owned</option>
                <option value="Leased">Leased/Tenant</option>
                <option value="Shared">Shared / Joint</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Soil & Irrigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <SectionHeader icon={Droplets} title="Soil & Irrigation" desc="Soil conditions and water management" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
              <select {...register('soil_type')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select soil</option>
                <option value="Alluvial">Alluvial Soil</option>
                <option value="Black">Black Soil</option>
                <option value="Red">Red Soil</option>
                <option value="Laterite">Laterite Soil</option>
                <option value="Desert">Desert/Arid Soil</option>
                <option value="Mountain">Mountain/Forest Soil</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Water Source</label>
              <select {...register('water_source')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select source</option>
                <option value="Rainfed">Rainfed</option>
                <option value="Canal">Canal</option>
                <option value="Tubewell">Tubewell / Borewell</option>
                <option value="River">River / Pond</option>
                <option value="Well">Open Well</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Type</label>
              <select {...register('irrigation_type')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select type</option>
                <option value="None">None (Rainfed)</option>
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Surface">Surface / Flood</option>
                <option value="Micro">Micro Irrigation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Equipment</label>
              <input type="text" {...register('irrigation_equipment')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="e.g. 5HP Pump, Drip lines" />
            </div>
          </div>
        </div>

        {/* SECTION 3: Cultivation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <SectionHeader icon={Leaf} title="Current Cultivation" desc="Primary crops and expected yield" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Category</label>
              <select {...register('crop_category')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select Category</option>
                <option value="Cereals">Cereals</option>
                <option value="Pulses">Pulses</option>
                <option value="Oilseeds">Oilseeds</option>
                <option value="Cash Crop">Cash Crop</option>
                <option value="Horticulture">Horticulture</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Crop Type</label>
              <input type="text" {...register('crop_type')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="e.g. Wheat, Rice, Cotton" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Variety / Seed Name</label>
              <input type="text" {...register('crop_variety')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="e.g. PBW-343" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Yield (kg/ha)</label>
              <input type="number" {...register('expected_yield', { valueAsNumber: true })} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="e.g. 3500" />
            </div>
          </div>
        </div>

        {/* SECTION 4: Machinery */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <SectionHeader icon={Tractor} title="Machinery & Infrastructure" desc="Available farm equipment" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Machinery Owned</label>
              <input type="text" {...register('farm_machinery')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors" placeholder="e.g. Tractor, Cultivator" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Facility Type</label>
              <select {...register('storage_facility')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
                <option value="">Select Facility</option>
                <option value="None">None</option>
                <option value="Warehouse">Warehouse (Dry)</option>
                <option value="Cold Storage">Cold Storage</option>
                <option value="Silo">Silo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : (exists ? 'Update Farm' : 'Save Farm')}
            {!saving && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
