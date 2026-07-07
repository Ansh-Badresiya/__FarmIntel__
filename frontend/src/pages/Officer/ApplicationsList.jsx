import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { officerService } from '../../services/officerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending',  label: 'Pending'  },
  { value: 'under_verification', label: 'Verifying' },
  { value: 'need_info', label: 'Action Required' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const StatusBadge = ({ status }) => {
  const map = {
    approved:           { cls: 'status-approved',           label: 'Approved' },
    rejected:           { cls: 'status-rejected',           label: 'Rejected' },
    need_info:          { cls: 'status-need_info',          label: 'Action Required' },
    under_verification: { cls: 'status-under_verification', label: 'Under Review' },
    pending:            { cls: 'status-pending',            label: 'Pending' },
  };
  const m = map[status] || map.pending;
  return <span className={`status-badge ${m.cls}`}>{m.label}</span>;
};

export const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [refreshing, setRefreshing]     = useState(false);

  // Filters
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  
  // Sorting
  const [sortField, setSortField]   = useState('application_date');
  const [sortDir,   setSortDir]     = useState('desc');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const filtered = applications
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
    if (sortField !== field) return <span style={{ color: '#888', fontSize: '10px', marginLeft: '4px' }}>▼</span>;
    return sortDir === 'asc'
      ? <span style={{ color: '#fff', fontSize: '10px', marginLeft: '4px' }}>▲</span>
      : <span style={{ color: '#fff', fontSize: '10px', marginLeft: '4px' }}>▼</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Page Header */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--gov-border)',
        borderLeft: '4px solid var(--gov-orange)',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--gov-navy)' }}>
            Application Queue
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
            Showing {filtered.length} applications {applications.length !== filtered.length ? `(filtered from ${applications.length})` : ''}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="gov-btn gov-btn-outline"
          style={{ fontSize: '13px' }}
        >
          {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      <ErrorAlert message={error} />

      {/* Filter Bar */}
      <div className="gov-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="gov-label">Search</label>
            <input
              type="text"
              placeholder="Farmer Name, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="gov-input"
            />
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="gov-label">District</label>
            <input
              type="text"
              placeholder="Enter district..."
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="gov-input"
            />
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="gov-label">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="gov-input"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flexShrink: 0 }}>
            <button
              onClick={() => { setSearch(''); setDistrictFilter(''); setStatusFilter(''); }}
              className="gov-btn gov-btn-outline"
              style={{ fontSize: '13px', height: '35px' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="gov-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="gov-table">
            <thead>
              <tr>
                {[
                  { field: 'id',               label: 'Application ID' },
                  { field: 'farmer_id',         label: 'Farmer Details' },
                  { field: 'scheme_id',         label: 'Scheme Name' },
                  { field: 'application_date',  label: 'Date Applied' },
                  { field: 'status',            label: 'Status' },
                ].map(col => (
                  <th
                    key={col.field}
                    onClick={() => toggleSort(col.field)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    {col.label} <SortIcon field={col.field} />
                  </th>
                ))}
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: 'var(--gov-text-muted)' }}>
                    #{app.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gov-navy)', fontSize: '13px' }}>{app.farmer_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gov-text-muted)' }}>{app.farmer_district}</div>
                  </td>
                  <td style={{ fontSize: '13px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {app.scheme_name}
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {new Date(app.application_date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={`/officer/application/${app.id}`}
                      className="gov-btn gov-btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '12px' }}></div>
                    <p style={{ fontWeight: 600, color: 'var(--gov-text)', margin: '0 0 6px' }}>No Applications Found</p>
                    <p style={{ fontSize: '13px', color: 'var(--gov-text-light)', margin: 0 }}>
                      Try adjusting your filters or search term.
                    </p>
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
