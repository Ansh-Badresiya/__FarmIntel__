import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ToastContainer, useToasts } from '../../components/shared/Toast';
import { useForm } from 'react-hook-form';

const DEFAULT_RULE_LOGIC = JSON.stringify(
  { field: 'age', operator: '>=', value: 18 },
  null, 2
);

const OPERATOR_OPTIONS = ['>=', '<=', '>', '<', '==', '!=', 'in', 'not_in'];
const FIELD_OPTIONS = [
  'age', 'land_size', 'state', 'district', 'is_verified',
  'annual_income', 'crop_type', 'irrigation_type',
];

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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
      <div>
        <label className="gov-label">Field</label>
        <select value={state.field} onChange={e => update({ field: e.target.value })} className="gov-input">
          <option value="">— select —</option>
          {FIELD_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div>
        <label className="gov-label">Operator</label>
        <select value={state.operator} onChange={e => update({ operator: e.target.value })} className="gov-input">
          {OPERATOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="gov-label">Value</label>
        <input type="text" value={state.val} onChange={e => update({ val: e.target.value })} placeholder="e.g. 18" className="gov-input" />
      </div>
    </div>
  );
};

const RuleFormModal = ({ rule, schemes, onClose, onSaved }) => {
  const isEdit = !!rule;
  const initialLogic = isEdit ? JSON.stringify(rule.rule_logic, null, 2) : DEFAULT_RULE_LOGIC;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isEdit
      ? { rule_name: rule.rule_name, scheme_id: rule.scheme_id, priority: rule.priority }
      : { rule_name: '', scheme_id: '', priority: 0 },
  });

  const [jsonText, setJsonText]     = useState(initialLogic);
  const [jsonError, setJsonError]   = useState('');
  const [mode, setMode]             = useState('structured');

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ position: 'relative', background: '#fff', borderRadius: '6px', width: '100%', maxWidth: '600px', margin: '0 16px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--gov-border)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: 'var(--gov-navy)', borderBottom: '2px solid var(--gov-orange)', position: 'sticky', top: 0, zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', flex: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEdit ? 'Edit Eligibility Rule' : 'New Eligibility Rule'}
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff', padding: '4px 8px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px' }}>
          
          <div style={{ marginBottom: '16px' }}>
            <label className="gov-label">Rule Name <span style={{ color: '#C0392B' }}>*</span></label>
            <input type="text" {...register('rule_name', { required: 'Required' })} placeholder="e.g. Min Age 18" className="gov-input" />
            {errors.rule_name && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.rule_name.message}</p>}
          </div>

          {!isEdit && (
            <div style={{ marginBottom: '16px' }}>
              <label className="gov-label">Scheme <span style={{ color: '#C0392B' }}>*</span></label>
              <select {...register('scheme_id', { required: 'Required' })} className="gov-input">
                <option value="">— select scheme —</option>
                {schemes.filter(s => s.is_active).map(s => (
                  <option key={s.id} value={s.id}>{s.scheme_name}</option>
                ))}
              </select>
              {errors.scheme_id && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.scheme_id.message}</p>}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label className="gov-label">Priority <span style={{ fontSize: '11px', color: 'var(--gov-text-muted)' }}>(higher evaluated first)</span></label>
            <input type="number" {...register('priority')} className="gov-input" />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="gov-label" style={{ margin: 0 }}>Rule Logic <span style={{ color: '#C0392B' }}>*</span></label>
              <div style={{ display: 'flex', gap: '4px', background: '#F0F0F0', padding: '2px', borderRadius: '4px' }}>
                <button type="button" onClick={() => setMode('structured')} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', background: mode === 'structured' ? '#fff' : 'transparent', border: 'none', borderRadius: '4px' }}>Form</button>
                <button type="button" onClick={() => setMode('json')} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', background: mode === 'json' ? '#fff' : 'transparent', border: 'none', borderRadius: '4px' }}>JSON</button>
              </div>
            </div>

            {mode === 'structured' ? (
              <div style={{ background: '#FFF9E6', border: '1px solid #FFE082', padding: '16px', borderRadius: '4px' }}>
                <StructuredEditor value={jsonText} onChange={setJsonText} />
              </div>
            ) : (
              <div>
                <textarea
                  value={jsonText} onChange={e => handleJsonChange(e.target.value)} rows={7} spellCheck={false}
                  className="gov-input" style={{ fontFamily: 'monospace', resize: 'vertical', borderColor: jsonError ? '#C0392B' : 'var(--gov-border)' }}
                />
                {jsonError ? <p style={{ color: '#C0392B', fontSize: '12px', marginTop: '4px' }}>{jsonError}</p> : <p style={{ color: '#1A7A1A', fontSize: '12px', marginTop: '4px' }}>✅ Valid JSON</p>}
              </div>
            )}
          </div>

          <div style={{ background: '#F8F8F8', border: '1px solid var(--gov-border)', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gov-text-muted)' }}>Preview</p>
            <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: 'var(--gov-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {(() => { try { return JSON.stringify(JSON.parse(jsonText), null, 2); } catch { return jsonText; } })()}
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--gov-border)' }}>
            <button type="button" onClick={onClose} className="gov-btn gov-btn-outline">Cancel</button>
            <button type="submit" disabled={isSubmitting || !!jsonError} className="gov-btn gov-btn-primary">
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Rule' : 'Create Rule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', width: '100%', maxWidth: '400px', borderTop: '4px solid #C0392B' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--gov-navy)' }}>Delete Rule</h3>
        <p style={{ fontSize: '13px', margin: '0 0 12px' }}>Are you sure you want to permanently delete:</p>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gov-navy)', margin: '0 0 16px' }}>"{rule.rule_name}"?</p>
        <p style={{ fontSize: '12px', color: '#C0392B', margin: '0 0 24px' }}>This action cannot be undone.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="gov-btn gov-btn-outline">Cancel</button>
          <button onClick={handle} disabled={loading} className="gov-btn gov-btn-danger">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const RulesPage = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const [rules, setRules]             = useState([]);
  const [schemes, setSchemes]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [refreshing, setRefreshing]   = useState(false);
  const [schemeFilter, setSchemeFilter] = useState('');
  const [formRule, setFormRule]       = useState(undefined);
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

  const filtered = rules.filter(r => !schemeFilter || r.scheme_id === schemeFilter);

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
        <RuleFormModal rule={formRule} schemes={schemes} onClose={() => setFormRule(undefined)} onSaved={handleSaved} />
      )}
      {deleteRule && (
        <DeleteRuleModal rule={deleteRule} onClose={() => setDeleteRule(null)} onDeleted={handleDeleted} />
      )}

      <div>
        {/* Header */}
        <div style={{
          background: '#fff', border: '1px solid var(--gov-border)', borderLeft: '4px solid var(--gov-orange)',
          padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--gov-navy)' }}>
              Eligibility Rules Management
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
              {rules.length} rules defined across {Object.keys(grouped).length} schemes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => fetchData(true)} disabled={refreshing} className="gov-btn gov-btn-outline" style={{ padding: '6px 12px' }}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={() => setFormRule(null)} className="gov-btn gov-btn-primary" style={{ padding: '6px 12px' }}>
              New Rule
            </button>
          </div>
        </div>

        {error && <div className="gov-alert gov-alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        {/* Filter */}
        <div className="gov-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gov-navy)' }}>Filter by Scheme:</span>
          <select value={schemeFilter} onChange={e => setSchemeFilter(e.target.value)} className="gov-input" style={{ width: 'auto', minWidth: '240px' }}>
            <option value="">All Schemes ({rules.length} rules)</option>
            {schemes.map(s => (
              <option key={s.id} value={s.id}>
                {s.scheme_name} ({rules.filter(r => r.scheme_id === s.id).length} rules)
              </option>
            ))}
          </select>
          {schemeFilter && (
            <button onClick={() => setSchemeFilter('')} className="gov-btn gov-btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }}>Clear</button>
          )}
        </div>

        {/* Grouped Rules */}
        {Object.keys(grouped).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', border: '1px solid var(--gov-border)' }}>
            <div style={{ marginBottom: '12px' }}></div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--gov-navy)' }}>No Rules Found</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>Create your first eligibility rule.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(grouped).map(([schemeId, schemeRules]) => (
              <div key={schemeId} className="gov-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: 'var(--gov-navy)', borderBottom: '2px solid var(--gov-orange)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    {schemeMap[schemeId] || 'Unknown Scheme'}
                  </span>
                  <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '2px 8px', borderRadius: '2px' }}>
                    {schemeRules.length} Rule{schemeRules.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th style={{ width: '25%' }}>Rule Name</th>
                        <th style={{ width: '10%' }}>Priority</th>
                        <th style={{ width: '50%' }}>Logic</th>
                        <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...schemeRules].sort((a, b) => b.priority - a.priority).map(rule => (
                        <tr key={rule.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontSize: '13px', marginBottom: '2px' }}>{rule.rule_name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--gov-text-muted)', fontFamily: 'monospace' }}>{rule.id.slice(0, 12)}...</div>
                          </td>
                          <td>
                            <span style={{ background: rule.priority > 0 ? '#FFE0B2' : '#F0F0F0', color: rule.priority > 0 ? '#E65100' : '#666', padding: '2px 6px', borderRadius: '2px', fontSize: '12px', fontWeight: 600 }}>
                              {rule.priority > 0 ? `P${rule.priority}` : 'Default'}
                            </span>
                          </td>
                          <td>
                            <pre style={{ margin: 0, padding: '8px', background: '#F8F8F8', border: '1px solid var(--gov-border)', fontSize: '12px', fontFamily: 'monospace', color: 'var(--gov-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '80px', overflowY: 'auto' }}>
                              {JSON.stringify(rule.rule_logic, null, 2)}
                            </pre>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button onClick={() => setFormRule(rule)} className="gov-btn gov-btn-outline" style={{ padding: '4px 8px', fontSize: '12px', marginRight: '6px' }}>Edit</button>
                            <button onClick={() => setDeleteRule(rule)} className="gov-btn gov-btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
