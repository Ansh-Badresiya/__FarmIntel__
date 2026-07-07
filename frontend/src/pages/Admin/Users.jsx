import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ToastContainer, useToasts } from '../../components/shared/Toast';

const ROLES = ['farmer', 'officer', 'admin'];

const RoleBadge = ({ role }) => {
  let bg = '';
  if (role === 'admin') bg = 'status-approved';
  else if (role === 'officer') bg = 'status-under_verification';
  else bg = 'status-pending';

  return (
    <span className={`status-badge ${bg}`} style={{ textTransform: 'capitalize' }}>
      {role}
    </span>
  );
};

const RoleSelect = ({ userId, currentRole, onRoleChange, saving }) => {
  return (
    <select
      value={currentRole}
      onChange={(e) => onRoleChange(userId, e.target.value)}
      disabled={saving}
      className="gov-input"
      style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', textTransform: 'capitalize' }}
    >
      {ROLES.map(role => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  );
};

export const UsersPage = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId]     = useState(null);

  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch {
      setError('Failed to load users. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setSavingId(userId);
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      addToast(`Role updated to "${newRole}" successfully.`, 'success');
    } catch (e) {
      addToast(e?.response?.data?.detail || 'Failed to update role.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.full_name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />

      <div>
        {/* Header */}
        <div style={{
          background: '#fff', border: '1px solid var(--gov-border)', borderLeft: '4px solid var(--gov-orange)',
          padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--gov-navy)' }}>
              User Management
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
              Total users: {users.length} — view and update system roles.
            </p>
          </div>
          <button onClick={() => fetchUsers(true)} disabled={refreshing} className="gov-btn gov-btn-outline" style={{ padding: '6px 12px' }}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && <div className="gov-alert gov-alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        {/* Filter Bar */}
        <div className="gov-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="gov-label">Search Users</label>
            <input
              type="text" placeholder="Name or email..." value={search} onChange={e => setSearch(e.target.value)}
              className="gov-input"
            />
          </div>
          <div style={{ minWidth: '160px' }}>
            <label className="gov-label">Filter by Role</label>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="gov-input">
              <option value="">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="officer">Officers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            {(search || roleFilter) && (
              <button onClick={() => { setSearch(''); setRoleFilter(''); }} className="gov-btn gov-btn-outline" style={{ height: '35px' }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="gov-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'var(--gov-navy)', borderBottom: '2px solid var(--gov-orange)' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
              Showing {filtered.length} Users
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="gov-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Update Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontSize: '14px' }}>{u.full_name}</div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td>
                      {u.is_active ? <span className="status-badge status-approved">Active</span> : <span className="status-badge status-expired">Inactive</span>}
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {new Date(u.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <RoleSelect
                        userId={u.id}
                        currentRole={u.role}
                        onRoleChange={handleRoleChange}
                        saving={savingId === u.id}
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                      <div style={{ marginBottom: '12px' }}></div>
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--gov-navy)' }}>No Users Found</p>
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
