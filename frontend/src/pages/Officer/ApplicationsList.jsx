import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { officerService } from '../../services/officerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import {
  Search, Filter, FileText, Clock, CheckCircle, XCircle,
  ArrowRight, AlertCircle, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';

/* ── constants ────────────────────────────────────────────────────────────────*/
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending',  label: 'Pending'  },
  { value: 'under_verification', label: 'Verifying' },
  { value: 'need_info', label: 'Action Required' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const statusMeta = {
  pending:  { label: 'Pending',  icon: Clock,         bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  under_verification: { label: 'Verifying', icon: RefreshCw, bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  need_info: { label: 'Action Required', icon: AlertCircle, bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  approved: { label: 'Approved', icon: CheckCircle,   bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200'  },
  rejected: { label: 'Rejected', icon: XCircle,       bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-200'    },
};

/* ── helpers ──────────────────────────────────────────────────────────────────*/
const StatusBadge = ({ status }) => {
  const m = statusMeta[status] || statusMeta.pending;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
      border ${m.bg} ${m.text} ${m.border}`}>
      <Icon className="w-3 h-3" />
      {m.label}
    </span>
  );
};

/* ── component ────────────────────────────────────────────────────────────────*/
export const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [refreshing, setRefreshing]     = useState(false);

  // Filters
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField]   = useState('application_date');
  const [sortDir,   setSortDir]     = useState('desc');

  const [districtFilter, setDistrictFilter] = useState('');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      // Build query string
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      if (districtFilter) params.append('district', districtFilter);
      
      const res = await officerService.getApplications(params.toString());
      setApplications(res.data);
    } catch {
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search, districtFilter]);

  // Fetch when filters change (with debounce for search, but direct for simplicity here)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Client-side sort and date filter
  const filtered = applications
    .filter(a => {
      if (dateFrom && new Date(a.application_date) < new Date(dateFrom)) return false;
      if (dateTo   && new Date(a.application_date) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    })
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'application_date') { va = new Date(va); vb = new Date(vb); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1  : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-green-600" />
      : <ChevronDown className="w-3 h-3 text-green-600" />;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Queue</h1>
          <p className="text-gray-500 mt-1">
            {filtered.length} application{filtered.length !== 1 ? 's' : ''} found
            {applications.length !== filtered.length ? ` (filtered from ${applications.length})` : ''}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700
            border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              id="app-search"
              placeholder="Search by Farmer Name, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* District filter */}
          <div className="relative flex-1 max-w-[200px]">
            <input
              type="text"
              placeholder="District..."
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Status filter */}
          <select
            id="status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl
              focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none
              bg-white text-gray-700 min-w-[150px]"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Toggle advanced filters */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border rounded-xl transition-colors
              ${showFilters
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Advanced: date range */}
        {showFilters && (
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-medium text-gray-500 whitespace-nowrap">From:</label>
              <input
                type="date"
                id="date-from"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg
                  focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-medium text-gray-500 whitespace-nowrap">To:</label>
              <input
                type="date"
                id="date-to"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg
                  focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setSearch(''); setStatusFilter(''); }}
              className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { field: 'id',               label: 'Application ID' },
                  { field: 'farmer_id',         label: 'Farmer' },
                  { field: 'scheme_id',         label: 'Scheme' },
                  { field: 'application_date',  label: 'Date Applied' },
                  { field: 'status',            label: 'Status' },
                ].map(col => (
                  <th
                    key={col.field}
                    onClick={() => toggleSort(col.field)}
                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider
                      cursor-pointer select-none hover:bg-gray-100 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/70 transition-colors group">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-300" />
                      <span className="text-sm font-mono font-medium text-gray-800">
                        #{app.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                    {app.farmer_name}
                    <p className="text-xs text-gray-500 font-normal">{app.farmer_district}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                    <span className="truncate w-40 inline-block">{app.scheme_name}</span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(app.application_date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <Link
                      to={`/officer/application/${app.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                        text-green-700 bg-green-50 border border-green-200 rounded-lg
                        hover:bg-green-100 transition-colors group-hover:shadow-sm"
                    >
                      Review <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No applications found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
