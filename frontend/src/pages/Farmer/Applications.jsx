import React, { useEffect, useState } from 'react';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { Link } from 'react-router-dom';

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

export const Applications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await farmerService.getApplications();
        setApps(res.data);
      } catch (err) {
        setError('Failed to load your applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

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
            My Subsidy Applications
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
            Track the status of all submitted subsidy applications. — Total: <strong>{apps.length}</strong>
          </p>
        </div>
        <Link to="/farmer/subsidies" className="gov-btn gov-btn-primary" style={{ textDecoration: 'none', fontSize: '13px' }}>
          Apply for New Scheme
        </Link>
      </div>

      <ErrorAlert message={error} />

      {/* Applications Table */}
      <div className="gov-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Appl. No.</th>
                <th>Scheme Name</th>
                <th style={{ width: '130px' }}>Date Applied</th>
                <th style={{ width: '140px' }}>Status</th>
                <th>Officer Remarks / Updates</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app, i) => (
                <tr key={app.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: 'var(--gov-text-muted)' }}>
                    #{app.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gov-navy)', fontSize: '13px' }}>
                      {app.scheme?.scheme_name || 'Unknown Scheme'}
                    </div>
                    {app.scheme?.department && (
                      <div style={{ fontSize: '11px', color: 'var(--gov-text-muted)', marginTop: '2px' }}>
                        {app.scheme.department}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {new Date(app.application_date).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td style={{ maxWidth: '260px' }}>
                    {app.status === 'need_info' ? (
                      <div className="gov-alert gov-alert-warning" style={{ padding: '6px 10px', fontSize: '12px' }}>
                        <span><strong>Document Request:</strong> {app.notes}</span>
                      </div>
                    ) : app.status === 'approved' ? (
                      <div className="gov-alert gov-alert-success" style={{ padding: '6px 10px', fontSize: '12px' }}>
                        <span>{app.notes || 'Application approved successfully.'}</span>
                      </div>
                    ) : app.status === 'rejected' ? (
                      <div className="gov-alert gov-alert-error" style={{ padding: '6px 10px', fontSize: '12px' }}>
                        <span>{app.notes || 'Application rejected.'}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--gov-text-muted)' }}>
                        {app.notes || 'No remarks yet.'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {apps.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '12px' }}></div>
                    <p style={{ fontWeight: 600, color: 'var(--gov-text)', margin: '0 0 6px' }}>
                      No Applications Found
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--gov-text-light)', margin: '0 0 16px' }}>
                      You haven't submitted any applications yet.
                    </p>
                    <Link to="/farmer/subsidies" className="gov-btn gov-btn-primary" style={{ textDecoration: 'none', fontSize: '13px' }}>
                      Browse Eligible Schemes
                    </Link>
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
