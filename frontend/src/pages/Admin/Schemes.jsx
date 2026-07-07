import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ToastContainer, useToasts } from '../../components/shared/Toast';
import { useForm } from 'react-hook-form';
import {
  Shield, Plus, Pencil, Trash2, X, AlertCircle, RefreshCw,
  CheckCircle, XCircle, Search, ChevronDown, ChevronUp,
} from 'lucide-react';

/* ── helpers ────────────────────────────────────────────────────────────── */
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

/* ── Scheme Form Modal ─────────────────────────────────────────────────── */
const SchemeFormModal = ({ scheme, onClose, onSaved }) => {
  const isEdit = !!scheme;
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm({
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

  // Multi-select states / seasons stored as arrays in local state
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
          <Shield className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900 flex-1">
            {isEdit ? 'Edit Scheme' : 'Create New Scheme'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Scheme Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Scheme Name *</label>
            <input
              id="scheme-name"
              type="text"
              {...register('scheme_name', { required: 'Scheme name is required' })}
              placeholder="e.g. PM Kisan Samman Nidhi"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl
                focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
            {errors.scheme_name && <p className="mt-1 text-xs text-red-600">{errors.scheme_name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              id="scheme-description"
              rows={3}
              {...register('description')}
              placeholder="Brief description of the scheme's purpose and benefits…"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl
                focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition"
            />
          </div>

          {/* Subsidy Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subsidy Amount (₹) *</label>
            <input
              id="scheme-amount"
              type="number"
              step="0.01"
              min="0"
              {...register('subsidy_amount', {
                required: 'Subsidy amount is required',
                min: { value: 0, message: 'Amount must be positive' },
              })}
              placeholder="e.g. 6000"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl
                focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
            {errors.subsidy_amount && <p className="mt-1 text-xs text-red-600">{errors.subsidy_amount.message}</p>}
          </div>

          {/* Applicable Seasons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Seasons</label>
            <div className="flex gap-2 flex-wrap">
              {SEASONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSeason(s)}
                  className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                    selectedSeasons.includes(s)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Applicable States */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicable States
              {selectedStates.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                  {selectedStates.length} selected
                </span>
              )}
            </label>
            <input
              type="text"
              placeholder="Search states…"
              value={stateSearch}
              onChange={e => setStateSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-2
                focus:ring-2 focus:ring-purple-400 outline-none transition"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredStates.map(s => (
                <label key={s} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(s)}
                    onChange={() => toggleState(s)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-400"
                  />
                  <span className="text-xs text-gray-700 truncate">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          {isEdit && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is-active"
                {...register('is_active')}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-400"
              />
              <label htmlFor="is-active" className="text-sm font-medium text-gray-700">
                Scheme is active (visible to farmers)
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200
                rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl
                hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving…' : isEdit ? 'Update Scheme' : 'Create Scheme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Delete Confirm Modal ─────────────────────────────────────────────── */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-50 p-2.5 rounded-xl">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Deactivate Scheme</h3>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          Are you sure you want to deactivate:
        </p>
        <p className="text-sm font-semibold text-gray-900 mb-5">"{scheme.scheme_name}"?</p>
        <p className="text-xs text-gray-500 mb-5">
          This is a soft delete — the scheme will no longer be visible to farmers but data is preserved.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl
              hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Deactivating…' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── page ────────────────────────────────────────────────────────────────── */
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
  const [expandedId, setExpandedId]   = useState(null);

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
        <SchemeFormModal
          scheme={formScheme}
          onClose={() => setFormScheme(undefined)}
          onSaved={handleSaved}
        />
      )}
      {deleteScheme && (
        <DeleteModal
          scheme={deleteScheme}
          onClose={() => setDeleteScheme(null)}
          onDeleted={handleDeleted}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" />
              Subsidy Schemes
            </h1>
            <p className="text-gray-500 mt-1">
              {schemes.filter(s => s.is_active).length} active · {schemes.filter(s => !s.is_active).length} inactive
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchSchemes(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700
                border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="create-scheme-btn"
              onClick={() => setFormScheme(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white
                bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Scheme
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />{error}
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search schemes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
          </div>
          <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={e => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-400"
            />
            Show inactive
          </label>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(scheme => (
            <div
              key={scheme.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
                ${scheme.is_active ? 'border-gray-100' : 'border-gray-200 opacity-70'}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between p-5 pb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">{scheme.scheme_name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                      ${scheme.is_active
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                      {scheme.is_active
                        ? <><CheckCircle className="w-3 h-3" /> Active</>
                        : <><XCircle className="w-3 h-3" /> Inactive</>}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700 mt-1.5">
                    ₹{scheme.subsidy_amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setFormScheme(scheme)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {scheme.is_active && (
                    <button
                      onClick={() => setDeleteScheme(scheme)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Deactivate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {scheme.description && (
                <p className="px-5 text-sm text-gray-500 leading-relaxed line-clamp-2">{scheme.description}</p>
              )}

              {/* Tags */}
              <div className="px-5 pt-3 pb-3 flex flex-wrap gap-1.5">
                {scheme.applicable_seasons?.map(s => (
                  <span key={s} className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                    {s}
                  </span>
                ))}
                {scheme.applicable_states?.slice(0, 3).map(s => (
                  <span key={s} className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                    {s}
                  </span>
                ))}
                {(scheme.applicable_states?.length || 0) > 3 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                    +{scheme.applicable_states.length - 3} more
                  </span>
                )}
              </div>

              {/* Expand toggle */}
              <button
                onClick={() => setExpandedId(expandedId === scheme.id ? null : scheme.id)}
                className="w-full flex items-center justify-center gap-1 py-2 border-t border-gray-50
                  text-xs text-gray-400 hover:bg-gray-50 transition-colors"
              >
                {expandedId === scheme.id ? (
                  <><ChevronUp className="w-3.5 h-3.5" /> Hide details</>
                ) : (
                  <><ChevronDown className="w-3.5 h-3.5" /> Show details</>
                )}
              </button>

              {/* Expanded details */}
              {expandedId === scheme.id && (
                <div className="px-5 pb-4 border-t border-gray-50 pt-3 space-y-2 text-xs text-gray-500">
                  <p><span className="font-semibold text-gray-700">ID:</span> <span className="font-mono">{scheme.id}</span></p>
                  <p><span className="font-semibold text-gray-700">Created:</span> {new Date(scheme.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  {scheme.application_deadline && (
                    <p className="text-orange-700 font-medium"><span>Deadline:</span>{' '}{new Date(scheme.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  )}
                  {scheme.max_beneficiaries && (
                    <p><span className="font-semibold text-gray-700">Max Beneficiaries:</span> {scheme.max_beneficiaries.toLocaleString()}</p>
                  )}
                  {scheme.department && (
                    <p><span className="font-semibold text-gray-700">Department:</span> {scheme.department}</p>
                  )}
                  <p><span className="font-semibold text-gray-700">States ({scheme.applicable_states?.length || 0}):</span> {scheme.applicable_states?.join(', ') || '—'}</p>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-2 py-16 flex flex-col items-center justify-center text-center">
              <Shield className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No schemes found</p>
              <p className="text-sm text-gray-400 mt-1">Create your first scheme to get started.</p>
              <button
                onClick={() => setFormScheme(null)}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white
                  bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Scheme
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
