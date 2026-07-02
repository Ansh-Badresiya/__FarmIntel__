import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ToastContainer, useToasts } from '../../components/shared/Toast';
import {
  Search, Users, UserCheck, Shield, UserCircle,
  AlertCircle, RefreshCw, ChevronDown, Filter,
} from 'lucide-react';

/* ── constants ───────────────────────────────────────────────────────────── */
const ROLES = ['farmer', 'officer', 'admin'];
const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'farmer',  label: 'Farmers'  },
  { value: 'officer', label: 'Officers' },
  { value: 'admin',   label: 'Admins'   },
];

const roleMeta = {
  farmer:  { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200',  icon: UserCircle },
  officer: { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200',   icon: UserCheck  },
  admin:   { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', icon: Shield     },
};

/* ── sub-components ─────────────────────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const m = roleMeta[role] || roleMeta.farmer;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
      border capitalize ${m.bg} ${m.text} ${m.border}`}>
      <Icon className="w-3 h-3" />
      {role}
    </span>
  );
};

/* Role selector dropdown per row */
const RoleSelect = ({ userId, currentRole, onRoleChange, saving }) => {
  const [open, setOpen] = useState(false);
  const m = roleMeta[currentRole] || roleMeta.farmer;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={saving}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium
          transition-colors disabled:opacity-50 capitalize
          ${m.bg} ${m.text} ${m.border} hover:brightness-95`}
      >
        {saving ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            {currentRole}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => { setOpen(false); onRoleChange(userId, role); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors capitalize
                ${role === currentRole ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
            >
              {React.createElement(roleMeta[role]?.icon || UserCircle, { className: 'w-4 h-4' })}
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── page ────────────────────────────────────────────────────────────────── */
export const UsersPage = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId]     = useState(null);

  // Filters
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

  // client-side filter
  const filtered = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.full_name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Counts per role
  const counts = ROLES.reduce((acc, r) => {
    acc[r] = users.filter(u => u.role === r).length;
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-500 mt-1">
              {users.length} total users — view and update roles.
            </p>
          </div>
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700
              border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Role Summary Pills */}
        <div className="flex flex-wrap gap-3">
          {ROLES.map(role => {
            const m = roleMeta[role];
            const Icon = m.icon;
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium
                  transition-colors capitalize ${
                    roleFilter === role
                      ? `${m.bg} ${m.text} ${m.border} shadow-sm`
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {role}s
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  roleFilter === role ? 'bg-white/60' : 'bg-gray-100'
                }`}>
                  {counts[role]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="user-search"
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              id="role-filter"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-gray-700"
            >
              {ROLE_FILTER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          {(search || roleFilter) && (
            <button
              onClick={() => { setSearch(''); setRoleFilter(''); }}
              className="px-3 py-2 text-xs font-medium text-red-600 border border-red-200
                rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              {filtered.length} user{filtered.length !== 1 ? 's' : ''} shown
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50">
                <tr>
                  {['Full Name', 'Email', 'Role', 'Status', 'Joined', 'Change Role'].map(h => (
                    <th key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600
                          rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        border ${u.is_active
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
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
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No users found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter.</p>
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
