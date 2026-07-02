import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ToastContainer, useToasts } from '../../components/shared/Toast';
import { useForm } from 'react-hook-form';
import {
  Settings, Plus, Pencil, Trash2, X, AlertCircle,
  RefreshCw, ChevronDown, Shield, Hash, ArrowUpDown,
  Code2, CheckCircle,
} from 'lucide-react';

/* ── JSON Editor helpers ───────────────────────────────────────────────── */
const DEFAULT_RULE_LOGIC = JSON.stringify(
  { field: 'age', operator: '>=', value: 18 },
  null, 2
);

const OPERATOR_OPTIONS = ['>=', '<=', '>', '<', '==', '!=', 'in', 'not_in'];
const FIELD_OPTIONS = [
  'age', 'land_size', 'state', 'district', 'is_verified',
  'annual_income', 'crop_type', 'irrigation_type',
];

/** Structured form for simple single-condition rules */
const StructuredEditor = ({ value, onChange }) => {
  const parse = (v) => {
    try {
      const p = JSON.parse(v);
      return { field: p.field || '', operator: p.operator || '>=', val: p.value ?? '' };
    } catch {
      return { field: '', operator: '>=', val: '' };
    }
  };

  const [state, setState] = useState(() => parse(value));

  const update = (patch) => {
    const next = { ...state, ...patch };
    setState(next);
    onChange(JSON.stringify({ field: next.field, operator: next.operator, value: next.val }, null, 2));
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Field */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Field</label>
        <select
          value={state.field}
          onChange={e => update({ field: e.target.value })}
          className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">— select —</option>
          {FIELD_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      {/* Operator */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Operator</label>
        <select
          value={state.operator}
          onChange={e => update({ operator: e.target.value })}
          className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
        >
          {OPERATOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      {/* Value */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
        <input
          type="text"
          value={state.val}
          onChange={e => update({ val: e.target.value })}
          placeholder="e.g. 18 or 'Punjab'"
          className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
        />
      </div>
    </div>
  );
};

/* ── Rule Form Modal ───────────────────────────────────────────────────── */
const RuleFormModal = ({ rule, schemes, onClose, onSaved }) => {
  const isEdit = !!rule;

  const initialLogic = isEdit
    ? JSON.stringify(rule.rule_logic, null, 2)
    : DEFAULT_RULE_LOGIC;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isEdit
      ? { rule_name: rule.rule_name, scheme_id: rule.scheme_id, priority: rule.priority }
      : { rule_name: '', scheme_id: '', priority: 0 },
  });

  const [jsonText, setJsonText]     = useState(initialLogic);
  const [jsonError, setJsonError]   = useState('');
  const [mode, setMode]             = useState('structured'); // 'structured' | 'json'

  const validateJson = (text) => {
    try { JSON.parse(text); setJsonError(''); return true; }
    catch (e) { setJsonError(e.message); return false; }
  };

  const handleJsonChange = (text) => {
    setJsonText(text);
    validateJson(text);
  };

  const onSubmit = async (data) => {
    if (!validateJson(jsonText)) return;
    const payload = {
      rule_name:  data.rule_name,
      priority:   parseInt(data.priority, 10),
      rule_logic: JSON.parse(jsonText),
      ...(isEdit ? {} : { scheme_id: data.scheme_id }),
    };
    try {
      if (isEdit) {
        await adminService.updateRule(rule.id, payload);
        onSaved('Rule updated successfully!');
      } else {
        await adminService.createRule(payload);
        onSaved('Rule created successfully!');
      }
    } catch (e) {
      throw e;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
          <Settings className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-900 flex-1">
            {isEdit ? 'Edit Eligibility Rule' : 'New Eligibility Rule'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Rule Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rule Name *</label>
            <input
              id="rule-name"
              type="text"
              {...register('rule_name', { required: 'Rule name is required' })}
              placeholder="e.g. Minimum Age Check"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl
                focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
            />
            {errors.rule_name && <p className="mt-1 text-xs text-red-600">{errors.rule_name.message}</p>}
          </div>

          {/* Scheme selector – only for create */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Scheme *</label>
              <select
                id="rule-scheme"
                {...register('scheme_id', { required: 'Please select a scheme' })}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl
                  focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">— select scheme —</option>
                {schemes.filter(s => s.is_active).map(s => (
                  <option key={s.id} value={s.id}>{s.scheme_name}</option>
                ))}
              </select>
              {errors.scheme_id && <p className="mt-1 text-xs text-red-600">{errors.scheme_id.message}</p>}
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Priority
              <span className="ml-1.5 text-xs text-gray-400 font-normal">(higher = evaluated first)</span>
            </label>
            <input
              id="rule-priority"
              type="number"
              {...register('priority')}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl
                focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Rule Logic – mode toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Rule Logic *</label>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                {[
                  { id: 'structured', label: 'Form', icon: Settings },
                  { id: 'json',       label: 'JSON', icon: Code2 },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors
                      ${mode === id
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Icon className="w-3 h-3" />{label}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'structured' ? (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-700 mb-3 font-medium">
                  Simple single-condition builder. Switch to JSON for complex logic.
                </p>
                <StructuredEditor value={jsonText} onChange={setJsonText} />
              </div>
            ) : (
              <div>
                <textarea
                  value={jsonText}
                  onChange={e => handleJsonChange(e.target.value)}
                  rows={7}
                  className={`w-full px-3 py-2.5 text-sm font-mono border rounded-xl
                    focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-y transition
                    ${jsonError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  spellCheck={false}
                />
                {jsonError ? (
                  <p className="mt-1 text-xs text-red-600 font-mono">{jsonError}</p>
                ) : (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Valid JSON
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Preview</p>
            <pre className="text-xs text-gray-700 overflow-x-auto font-mono">
              {(() => {
                try { return JSON.stringify(JSON.parse(jsonText), null, 2); }
                catch { return jsonText; }
              })()}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200
                rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !!jsonError}
              className="px-5 py-2 text-sm font-medium text-white bg-amber-600 rounded-xl
                hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving…' : isEdit ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Delete Confirm ────────────────────────────────────────────────────── */
const DeleteRuleModal = ({ rule, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      await adminService.deleteRule(rule.id);
      onDeleted('Rule deleted successfully.');
    } catch (e) {
      onDeleted(null, e?.response?.data?.detail || 'Failed to delete rule.');
    } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-50 p-2.5 rounded-xl"><Trash2 className="w-5 h-5 text-red-600" /></div>
          <h3 className="text-base font-semibold text-gray-900">Delete Rule</h3>
        </div>
        <p className="text-sm text-gray-600 mb-1">Are you sure you want to permanently delete:</p>
        <p className="text-sm font-semibold text-gray-900 mb-5">"{rule.rule_name}"?</p>
        <p className="text-xs text-red-500 mb-5">This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handle} disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-60">
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── page ────────────────────────────────────────────────────────────────── */
export const RulesPage = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const [rules, setRules]             = useState([]);
  const [schemes, setSchemes]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [refreshing, setRefreshing]   = useState(false);
  const [schemeFilter, setSchemeFilter] = useState('');
  const [formRule, setFormRule]       = useState(undefined); // null=create, obj=edit
  const [deleteRule, setDeleteRule]   = useState(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const [rulesRes, schemesRes] = await Promise.all([
        adminService.getRules(),
        adminService.getSchemes(),
      ]);
      setRules(rulesRes.data);
      setSchemes(schemesRes.data);
    } catch {
      setError('Failed to load rules or schemes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaved = (successMsg, errMsg) => {
    if (errMsg) { addToast(errMsg, 'error'); return; }
    addToast(successMsg, 'success');
    setFormRule(undefined);
    fetchData(true);
  };

  const handleDeleted = (successMsg, errMsg) => {
    if (errMsg) { addToast(errMsg, 'error'); setDeleteRule(null); return; }
    addToast(successMsg, 'success');
    setDeleteRule(null);
    fetchData(true);
  };

  const schemeMap = Object.fromEntries(schemes.map(s => [s.id, s.scheme_name]));

  const filtered = rules.filter(r =>
    !schemeFilter || r.scheme_id === schemeFilter
  );

  // Group rules by scheme
  const grouped = filtered.reduce((acc, rule) => {
    const key = rule.scheme_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(rule);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />
      {formRule !== undefined && (
        <RuleFormModal
          rule={formRule}
          schemes={schemes}
          onClose={() => setFormRule(undefined)}
          onSaved={handleSaved}
        />
      )}
      {deleteRule && (
        <DeleteRuleModal
          rule={deleteRule}
          onClose={() => setDeleteRule(null)}
          onDeleted={handleDeleted}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-amber-600" />
              Eligibility Rules
            </h1>
            <p className="text-gray-500 mt-1">
              {rules.length} rule{rules.length !== 1 ? 's' : ''} across {Object.keys(grouped).length} scheme{Object.keys(grouped).length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700
                border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="create-rule-btn"
              onClick={() => setFormRule(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white
                bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Rule
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />{error}
          </div>
        )}

        {/* Scheme filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filter by scheme:</span>
          <select
            id="scheme-filter"
            value={schemeFilter}
            onChange={e => setSchemeFilter(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-200 rounded-xl
              focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white text-gray-700"
          >
            <option value="">All Schemes ({rules.length} rules)</option>
            {schemes.map(s => (
              <option key={s.id} value={s.id}>
                {s.scheme_name} ({rules.filter(r => r.scheme_id === s.id).length} rules)
              </option>
            ))}
          </select>
          {schemeFilter && (
            <button
              onClick={() => setSchemeFilter('')}
              className="px-3 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50"
            >
              Clear
            </button>
          )}
        </div>

        {/* Grouped rule cards */}
        {Object.keys(grouped).length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Settings className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No rules found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first eligibility rule.</p>
            <button
              onClick={() => setFormRule(null)}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white
                bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Rule
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([schemeId, schemeRules]) => (
            <div key={schemeId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Scheme heading */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-purple-50/60">
                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="font-semibold text-purple-800 text-sm">
                  {schemeMap[schemeId] || 'Unknown Scheme'}
                </span>
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                  {schemeRules.length} rule{schemeRules.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Rules table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-50">
                  <thead className="bg-gray-50/60">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Rule Name</span>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><ArrowUpDown className="w-3.5 h-3.5" /> Priority</span>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Code2 className="w-3.5 h-3.5" /> Rule Logic</span>
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...schemeRules]
                      .sort((a, b) => b.priority - a.priority)
                      .map(rule => (
                        <tr key={rule.id} className="hover:bg-amber-50/30 transition-colors group">
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-gray-900">{rule.rule_name}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                              {rule.id.slice(0, 12)}…
                            </p>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold
                              ${rule.priority > 0
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                              {rule.priority > 0 ? `P${rule.priority}` : 'Default'}
                            </span>
                          </td>
                          <td className="px-5 py-4 max-w-xs">
                            <pre className="text-xs text-gray-600 font-mono bg-gray-50 border border-gray-200
                              rounded-lg px-3 py-2 overflow-x-auto max-h-24 whitespace-pre-wrap break-all">
                              {JSON.stringify(rule.rule_logic, null, 2)}
                            </pre>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setFormRule(rule)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteRule(rule)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
