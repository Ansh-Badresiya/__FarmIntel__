import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { farmerService } from '../../services/farmerService';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

import { LocationSelector } from '../../components/shared/LocationSelector';

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
        width: '28px',
        height: '28px',
        background: 'var(--gov-orange)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
      }}>
        {number}
      </div>
      <div>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '1px' }}>{desc}</div>
      </div>
    </div>
    <div style={{ padding: '20px' }}>
      {children}
    </div>
  </div>
);

const FieldRow = ({ cols = 2, children }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '14px',
    marginBottom: '14px',
  }}>
    {children}
  </div>
);

const Field = ({ label, required, children, error }) => (
  <div>
    <label style={{
      display: 'block',
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--gov-text)',
      marginBottom: '5px',
    }}>
      {label} {required && <span style={{ color: '#C0392B' }}>*</span>}
    </label>
    {children}
    {error && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{error}</p>}
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
  const locationValues = {
    state: watch('state'),
    district: watch('district'),
    village: watch('village')
  };
  const handleLocationChange = (val) => {
    setValue('state', val.state);
    setValue('district', val.district);
    setValue('village', val.village);
  };

  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      setValue('age', age);
    }
  }, [dob, setValue]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await farmerService.getProfile();
        if (res.data) {
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
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--gov-border)',
        borderLeft: '4px solid var(--gov-orange)',
        padding: '14px 18px',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--gov-navy)' }}>
          Farmer Profile Registration
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
          Complete your profile to check eligibility for government schemes. Fields marked with <span style={{ color: '#C0392B' }}>*</span> are mandatory.
        </p>
      </div>

      <ErrorAlert message={error} />

      {success && (
        <div className="gov-alert gov-alert-success" style={{ marginBottom: '16px' }}>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1: Personal Details */}
        <SectionPanel number="1" icon="👤" title="Personal Details" desc="Your identity and contact information">
          <FieldRow cols={2}>
            <Field label="Full Name" error={errors.full_name?.message}>
              <input type="text" {...register('full_name')} disabled className="gov-input" />
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--gov-text-muted)' }}>Synced from your account</p>
            </Field>
            <Field label="Father's Name">
              <input type="text" {...register('father_name')} className="gov-input" placeholder="Father's full name" />
            </Field>
          </FieldRow>
          <FieldRow cols={2}>
            <Field label="Gender">
              <select {...register('gender')} className="gov-input">
                <option value="">-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Category">
              <select {...register('category')} className="gov-input">
                <option value="">-- Select Category --</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </Field>
          </FieldRow>
          <FieldRow cols={3}>
            <Field label="Date of Birth">
              <input type="date" {...register('date_of_birth')} className="gov-input" />
            </Field>
            <Field label="Age (Auto-calculated)">
              <input type="number" {...register('age')} readOnly className="gov-input" style={{ background: '#F8F8F8' }} />
            </Field>
            <Field label="Email Address">
              <input type="email" {...register('email')} disabled className="gov-input" />
            </Field>
          </FieldRow>
          <FieldRow cols={2}>
            <Field label="Phone Number" required error={errors.phone_number?.message}>
              <input
                type="text"
                {...register('phone_number', { required: 'Phone is required' })}
                className="gov-input"
                placeholder="+91 XXXXXXXXXX"
              />
            </Field>
            <Field label="Aadhaar Number" required error={errors.aadhar_number?.message}>
              <input
                type="text"
                {...register('aadhar_number', {
                  required: 'Aadhaar is required',
                  pattern: { value: /^\d{12}$/, message: 'Must be a 12-digit number' }
                })}
                className="gov-input"
                placeholder="12-digit Aadhaar number"
              />
            </Field>
          </FieldRow>
          <FieldRow cols={2}>
            <Field label="PAN Number">
              <input
                type="text"
                {...register('pan_number')}
                className="gov-input"
                placeholder="ABCDE1234F"
                style={{ textTransform: 'uppercase' }}
              />
            </Field>
            <div /> {/* spacer */}
          </FieldRow>
        </SectionPanel>

        {/* Section 2: Address Details */}
        <SectionPanel number="2" icon="📍" title="Address Details" desc="Your permanent residence">
          <div style={{ marginBottom: '14px' }}>
            <Field label="Street / House Address">
              <textarea
                {...register('address')}
                rows={2}
                className="gov-input"
                placeholder="House No., Street Name, Locality"
                style={{ resize: 'vertical' }}
              />
            </Field>
          </div>
          <FieldRow cols={2}>
            <Field label="Taluka / Tehsil">
              <input type="text" {...register('taluka')} className="gov-input" />
            </Field>
            <Field label="PIN Code">
              <input type="text" {...register('postal_code')} className="gov-input" />
            </Field>
          </FieldRow>
          <FieldRow cols={3}>
            <LocationSelector 
              value={locationValues} 
              onChange={handleLocationChange} 
              errors={{
                state: errors.state?.message,
                district: errors.district?.message,
                village: errors.village?.message
              }}
            />
          </FieldRow>
        </SectionPanel>

        {/* Section 3: Socio-Economic Profile */}
        <SectionPanel number="3" icon="💼" title="Socio-Economic Profile" desc="Required for scheme eligibility criteria">
          <FieldRow cols={2}>
            <Field label="Farmer Type">
              <select {...register('farmer_type')} className="gov-input">
                <option value="">-- Select Type --</option>
                <option value="Marginal">Marginal (up to 1 hectare)</option>
                <option value="Small">Small (1 to 2 hectares)</option>
                <option value="Medium">Medium (2 to 10 hectares)</option>
                <option value="Large">Large (more than 10 hectares)</option>
              </select>
            </Field>
            <Field label="Land Ownership">
              <select {...register('land_ownership')} className="gov-input">
                <option value="">-- Select Ownership --</option>
                <option value="Owned">Owned</option>
                <option value="Leased">Leased / Tenant</option>
                <option value="Joint">Joint / Shared</option>
              </select>
            </Field>
          </FieldRow>
          <FieldRow cols={2}>
            <Field label="Annual Income (₹)">
              <input
                type="number"
                {...register('annual_income', { valueAsNumber: true })}
                className="gov-input"
                placeholder="e.g. 150000"
              />
            </Field>
            <Field label="Education Level">
              <select {...register('education')} className="gov-input">
                <option value="">-- Select Education --</option>
                <option value="None">None</option>
                <option value="Primary">Primary (Up to 5th)</option>
                <option value="Secondary">Secondary (Up to 10th)</option>
                <option value="Higher Secondary">Higher Secondary (12th)</option>
                <option value="Graduate">Graduate & Above</option>
              </select>
            </Field>
          </FieldRow>
          <FieldRow cols={2}>
            <Field label="Primary Occupation">
              <input
                type="text"
                {...register('occupation')}
                className="gov-input"
                placeholder="e.g. Agriculture"
              />
            </Field>
            <div /> {/* spacer */}
          </FieldRow>
        </SectionPanel>

        {/* Section 4: Bank Details */}
        <SectionPanel number="4" icon="🏦" title="Bank Details" desc="For Direct Benefit Transfer (DBT) — handle with care">
          <FieldRow cols={2}>
            <Field label="Bank Account Number">
              <input
                type="password"
                {...register('bank_account_number')}
                className="gov-input"
                placeholder="Enter account number"
                style={{ fontFamily: 'monospace' }}
              />
            </Field>
            <Field label="IFSC Code">
              <input
                type="text"
                {...register('ifsc_code')}
                className="gov-input"
                placeholder="e.g. SBIN0001234"
                style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
              />
            </Field>
          </FieldRow>
          <div className="gov-alert gov-alert-warning" style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '12px' }}>
              Bank details are used exclusively for Direct Benefit Transfer (DBT) of approved subsidies. 
              Ensure accuracy to avoid payment failure.
            </span>
          </div>
        </SectionPanel>

        {/* Submit */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 0',
          borderTop: '1px solid var(--gov-border)',
        }}>
          <button
            type="submit"
            disabled={saving}
            className="gov-btn gov-btn-primary"
            style={{ padding: '10px 28px', fontSize: '14px' }}
          >
            {saving ? 'Saving...' : (exists ? 'Update Profile' : 'Save Profile')}
          </button>
        </div>
      </form>
    </div>
  );
};
