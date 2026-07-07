import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ToastContainer, useToasts } from '../../components/shared/Toast';
import { useForm } from 'react-hook-form';

const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'All'];
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const SchemeFormModal = ({ scheme, onClose, onSaved }) => {
  const isEdit = !!scheme;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isEdit ? {
      scheme_name:           scheme.scheme_name,
      description:           scheme.description || '',
      subsidy_amount:        scheme.subsidy_amount,
      is_active:             scheme.is_active,
      max_beneficiaries:     scheme.max_beneficiaries || '',
      application_deadline:  scheme.application_deadline
        ? new Date(scheme.application_deadline).toISOString().slice(0, 10)
        : '',
      department:            scheme.department || '',
      sector:                scheme.sector || '',
    } : {
      scheme_name:           '',
      description:           '',
      subsidy_amount:        '',
      is_active:             true,
      max_beneficiaries:     '',
      application_deadline:  '',
      department:            '',
      sector:                '',
    },
  });

  const [selectedStates,  setSelectedStates]  = useState(isEdit ? (scheme.applicable_states  || []) : []);
  const [selectedSeasons, setSelectedSeasons] = useState(isEdit ? (scheme.applicable_seasons || []) : []);
  const [stateSearch, setStateSearch] = useState('');

  const toggleState  = (s) => setSelectedStates(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleSeason = (s) => setSelectedSeasons(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const filteredStates = INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      subsidy_amount:     parseFloat(data.subsidy_amount),
      max_beneficiaries:  data.max_beneficiaries ? parseInt(data.max_beneficiaries) : null,
      applicable_states:  selectedStates,
      applicable_seasons: selectedSeasons,
      is_active:          Boolean(data.is_active),
      application_deadline: data.application_deadline 
        ? new Date(data.application_deadline).toISOString() 
        : null,
    };
    try {
      if (isEdit) {
        await adminService.updateScheme(scheme.id, payload);
        onSaved('Scheme updated successfully!');
      } else {
        await adminService.createScheme(payload);
        onSaved('Scheme created successfully!');
      }
    } catch (e) {
      throw e;
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        position: 'relative', background: '#fff', borderRadius: '6px', width: '100%', maxWidth: '640px',
        margin: '0 16px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        border: '1px solid var(--gov-border)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px',
          background: 'var(--gov-navy)', borderBottom: '2px solid var(--gov-orange)',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', flex: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEdit ? 'Edit Scheme' : 'Create New Scheme'}
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff', padding: '4px 8px' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="gov-label">Scheme Name <span style={{ color: '#C0392B' }}>*</span></label>
              <input type="text" {...register('scheme_name', { required: 'Required' })} className="gov-input" placeholder="e.g. PM Kisan" />
              {errors.scheme_name && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.scheme_name.message}</p>}
            </div>
            <div>
              <label className="gov-label">Subsidy Amount (₹) <span style={{ color: '#C0392B' }}>*</span></label>
              <input type="number" step="0.01" {...register('subsidy_amount', { required: 'Required', min: 0 })} className="gov-input" placeholder="e.g. 6000" />
              {errors.subsidy_amount && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.subsidy_amount.message}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="gov-label">Description</label>
            <textarea rows={3} {...register('description')} className="gov-input" style={{ resize: 'vertical' }} placeholder="Brief description..."></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="gov-label">Department</label>
              <input type="text" {...register('department')} className="gov-input" placeholder="e.g. Agriculture" />
            </div>
            <div>
              <label className="gov-label">Sector</label>
              <input type="text" {...register('sector')} className="gov-input" placeholder="e.g. Farming" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="gov-label">Application Deadline</label>
              <input type="date" {...register('application_deadline')} className="gov-input" />
            </div>
            <div>
              <label className="gov-label">Max Beneficiaries</label>
              <input type="number" {...register('max_beneficiaries')} className="gov-input" placeholder="Leave empty for unlimited" />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="gov-label">Applicable Seasons</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SEASONS.map(s => (
                <button
                  key={s} type="button" onClick={() => toggleSeason(s)}
                  style={{
                    padding: '4px 12px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer',
                    background: selectedSeasons.includes(s) ? 'var(--gov-orange)' : '#fff',
                    color: selectedSeasons.includes(s) ? '#fff' : 'var(--gov-text)',
                    border: `1px solid ${selectedSeasons.includes(s) ? 'var(--gov-orange)' : 'var(--gov-border)'}`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="gov-label">Applicable States ({selectedStates.length})</label>
            <input type="text" placeholder="Search states..." value={stateSearch} onChange={e => setStateSearch(e.target.value)} className="gov-input" style={{ marginBottom: '8px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '140px', overflowY: 'auto', padding: '4px', background: '#F8F8F8', border: '1px solid var(--gov-border)' }}>
              {filteredStates.map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedStates.includes(s)} onChange={() => toggleState(s)} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {isEdit && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" {...register('is_active')} />
                Scheme is active (visible to farmers)
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--gov-border)' }}>
            <button type="button" onClick={onClose} className="gov-btn gov-btn-outline">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="gov-btn gov-btn-primary">
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Scheme' : 'Create Scheme')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ scheme, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await adminService.deleteScheme(scheme.id);
      onDeleted('Scheme deactivated successfully.');
    } catch (e) {
      onDeleted(null, e?.response?.data?.detail || 'Failed to deactivate scheme.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', width: '100%', maxWidth: '400px', borderTop: '4px solid #C0392B' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>Deactivate Scheme</h3>
        <p style={{ fontSize: '13px', margin: '0 0 12px' }}>Are you sure you want to deactivate: <br/><strong>"{scheme.scheme_name}"</strong>?</p>
        <p style={{ fontSize: '12px', color: 'var(--gov-text-light)', margin: '0 0 24px' }}>This is a soft delete. The scheme will no longer be visible to farmers but past data is preserved.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="gov-btn gov-btn-outline">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="gov-btn gov-btn-danger">
            {loading ? 'Processing...' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SchemesPage = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const [schemes, setSchemes]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [refreshing, setRefreshing]   = useState(false);
  const [search, setSearch]           = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [formScheme, setFormScheme]   = useState(undefined); // null = create, obj = edit
  const [deleteScheme, setDeleteScheme] = useState(null);

  const fetchSchemes = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const res = await adminService.getSchemes();
      setSchemes(res.data);
    } catch {
      setError('Failed to load schemes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

  const handleSaved = (successMsg, errMsg) => {
    if (errMsg) { addToast(errMsg, 'error'); return; }
    addToast(successMsg, 'success');
    setFormScheme(undefined);
    fetchSchemes(true);
  };

  const handleDeleted = (successMsg, errMsg) => {
    if (errMsg) { addToast(errMsg, 'error'); setDeleteScheme(null); return; }
    addToast(successMsg, 'success');
    setDeleteScheme(null);
    fetchSchemes(true);
  };

  const filtered = schemes.filter(s => {
    if (!showInactive && !s.is_active) return false;
    if (search && !s.scheme_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />
      {formScheme !== undefined && (
        <SchemeFormModal scheme={formScheme} onClose={() => setFormScheme(undefined)} onSaved={handleSaved} />
      )}
      {deleteScheme && (
        <DeleteModal scheme={deleteScheme} onClose={() => setDeleteScheme(null)} onDeleted={handleDeleted} />
      )}

      <div>
        {/* Header */}
        <div style={{
          background: '#fff', border: '1px solid var(--gov-border)', borderLeft: '4px solid var(--gov-orange)',
          padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--gov-navy)' }}>
              Subsidy Schemes Management
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
              {schemes.filter(s => s.is_active).length} Active | {schemes.filter(s => !s.is_active).length} Inactive
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => fetchSchemes(true)} disabled={refreshing} className="gov-btn gov-btn-outline" style={{ padding: '6px 12px' }}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={() => setFormScheme(null)} className="gov-btn gov-btn-primary" style={{ padding: '6px 12px' }}>
              New Scheme
            </button>
          </div>
        </div>

        {error && <div className="gov-alert gov-alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        {/* Toolbar */}
        <div className="gov-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text" placeholder="Search schemes by name..." value={search} onChange={e => setSearch(e.target.value)}
            className="gov-input" style={{ flex: 1, minWidth: '200px' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
            Show Inactive Schemes
          </label>
        </div>

        {/* Table View Instead of Cards */}
        <div className="gov-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Scheme Name</th>
                  <th>Amount</th>
                  <th>Department</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(scheme => (
                  <tr key={scheme.id} style={{ opacity: scheme.is_active ? 1 : 0.6 }}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontSize: '14px', marginBottom: '2px' }}>{scheme.scheme_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gov-text-muted)' }}>ID: {scheme.id.slice(0,8)}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#1A7A1A' }}>₹{scheme.subsidy_amount.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '13px' }}>{scheme.department || '—'}</td>
                    <td style={{ fontSize: '13px' }}>
                      {scheme.application_deadline ? new Date(scheme.application_deadline).toLocaleDateString('en-IN') : 'None'}
                    </td>
                    <td>
                      {scheme.is_active ? <span className="status-badge status-approved">Active</span> : <span className="status-badge status-expired">Inactive</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => setFormScheme(scheme)} className="gov-btn gov-btn-outline" style={{ padding: '4px 8px', fontSize: '12px', marginRight: '6px' }}>Edit</button>
                      {scheme.is_active && (
                        <button onClick={() => setDeleteScheme(scheme)} className="gov-btn gov-btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }}>Deactivate</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                      <div style={{ marginBottom: '12px' }}></div>
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--gov-navy)' }}>No Schemes Found</p>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>Try adjusting search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
