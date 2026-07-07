import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

const SectionPanel = ({ number, icon, title, desc, children }) => (
  <div className="gov-card" style={{ marginBottom: '20px', overflow: 'hidden' }}>
    <div style={{
      background: 'var(--gov-navy)',
      borderBottom: '2px solid var(--gov-orange)',
      padding: '12px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      <div style={{
        width: '28px', height: '28px',
        background: 'var(--gov-orange)', borderRadius: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0,
      }}>
        {number}
      </div>
      <div>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '1px' }}>{desc}</div>
      </div>
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
);

const FieldGrid = ({ cols = 2, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '14px', marginBottom: '14px' }}>
    {children}
  </div>
);

const Field = ({ label, required, children, error }) => (
  <div>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gov-text)', marginBottom: '5px' }}>
      {label} {required && <span style={{ color: '#C0392B' }}>*</span>}
    </label>
    {children}
    {error && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{error}</p>}
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
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{
        background: '#fff', border: '1px solid var(--gov-border)',
        borderLeft: '4px solid var(--gov-orange)', padding: '14px 18px', marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--gov-navy)' }}>
          Farm Details Registration
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
          Provide comprehensive details about your agricultural land and farming practices.
          Fields marked with <span style={{ color: '#C0392B' }}>*</span> are mandatory.
        </p>
      </div>

      <ErrorAlert message={error} />
      {success && (
        <div className="gov-alert gov-alert-success" style={{ marginBottom: '16px' }}>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1: Land Details */}
        <SectionPanel number="1" icon="🗺️" title="Land Record Details" desc="Official land identifiers and ownership">
          <FieldGrid cols={2}>
            <Field label="Khata / Khasra Number">
              <input type="text" {...register('khata_number')} className="gov-input" placeholder="Land record number" />
            </Field>
            <Field label="Land Area (Hectares)" required error={errors.land_area?.message}>
              <input
                type="number" step="0.01"
                {...register('land_area', { required: 'Land area is required', valueAsNumber: true })}
                className="gov-input" placeholder="e.g. 2.5"
              />
            </Field>
          </FieldGrid>
          <FieldGrid cols={2}>
            <Field label="Ownership Type">
              <select {...register('ownership_type')} className="gov-input">
                <option value="">-- Select Ownership --</option>
                <option value="Owned">Owned</option>
                <option value="Leased">Leased / Tenant</option>
                <option value="Shared">Shared / Joint</option>
              </select>
            </Field>
            <div />
          </FieldGrid>
        </SectionPanel>

        {/* Section 2: Soil & Irrigation */}
        <SectionPanel number="2" icon="💧" title="Soil & Irrigation" desc="Soil conditions and water management">
          <FieldGrid cols={2}>
            <Field label="Soil Type">
              <select {...register('soil_type')} className="gov-input">
                <option value="">-- Select Soil Type --</option>
                <option value="Alluvial">Alluvial Soil</option>
                <option value="Black">Black Soil</option>
                <option value="Red">Red Soil</option>
                <option value="Laterite">Laterite Soil</option>
                <option value="Desert">Desert / Arid Soil</option>
                <option value="Mountain">Mountain / Forest Soil</option>
              </select>
            </Field>
            <Field label="Water Source">
              <select {...register('water_source')} className="gov-input">
                <option value="">-- Select Water Source --</option>
                <option value="Rainfed">Rainfed</option>
                <option value="Canal">Canal</option>
                <option value="Tubewell">Tubewell / Borewell</option>
                <option value="River">River / Pond</option>
                <option value="Well">Open Well</option>
              </select>
            </Field>
          </FieldGrid>
          <FieldGrid cols={2}>
            <Field label="Irrigation Type">
              <select {...register('irrigation_type')} className="gov-input">
                <option value="">-- Select Irrigation Type --</option>
                <option value="None">None (Rainfed)</option>
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Surface">Surface / Flood</option>
                <option value="Micro">Micro Irrigation</option>
              </select>
            </Field>
            <Field label="Irrigation Equipment">
              <input type="text" {...register('irrigation_equipment')} className="gov-input" placeholder="e.g. 5HP Pump, Drip Lines" />
            </Field>
          </FieldGrid>
        </SectionPanel>

        {/* Section 3: Cultivation */}
        <SectionPanel number="3" icon="🌾" title="Current Cultivation" desc="Primary crops and expected yield">
          <FieldGrid cols={2}>
            <Field label="Crop Category">
              <select {...register('crop_category')} className="gov-input">
                <option value="">-- Select Category --</option>
                <option value="Cereals">Cereals</option>
                <option value="Pulses">Pulses</option>
                <option value="Oilseeds">Oilseeds</option>
                <option value="Cash Crop">Cash Crop</option>
                <option value="Horticulture">Horticulture</option>
              </select>
            </Field>
            <Field label="Primary Crop Type">
              <input type="text" {...register('crop_type')} className="gov-input" placeholder="e.g. Wheat, Rice, Cotton" />
            </Field>
          </FieldGrid>
          <FieldGrid cols={2}>
            <Field label="Crop Variety / Seed Name">
              <input type="text" {...register('crop_variety')} className="gov-input" placeholder="e.g. PBW-343" />
            </Field>
            <Field label="Expected Yield (kg/hectare)">
              <input type="number" {...register('expected_yield', { valueAsNumber: true })} className="gov-input" placeholder="e.g. 3500" />
            </Field>
          </FieldGrid>
        </SectionPanel>

        {/* Section 4: Machinery */}
        <SectionPanel number="4" icon="🚜" title="Machinery & Infrastructure" desc="Available farm equipment and storage">
          <FieldGrid cols={2}>
            <Field label="Farm Machinery Owned">
              <input type="text" {...register('farm_machinery')} className="gov-input" placeholder="e.g. Tractor, Cultivator, Harvester" />
            </Field>
            <Field label="Storage Facility Type">
              <select {...register('storage_facility')} className="gov-input">
                <option value="">-- Select Facility --</option>
                <option value="None">None</option>
                <option value="Warehouse">Warehouse (Dry)</option>
                <option value="Cold Storage">Cold Storage</option>
                <option value="Silo">Silo</option>
              </select>
            </Field>
          </FieldGrid>
        </SectionPanel>

        {/* Submit */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: '12px', padding: '16px 0', borderTop: '1px solid var(--gov-border)',
        }}>
          <button
            type="submit"
            disabled={saving}
            className="gov-btn gov-btn-primary"
            style={{ padding: '10px 28px', fontSize: '14px' }}
          >
            {saving ? 'Saving...' : (exists ? 'Update Farm Details' : 'Save Farm Details')}
          </button>
        </div>
      </form>
    </div>
  );
};
