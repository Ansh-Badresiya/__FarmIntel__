import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { officerService } from '../../services/officerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

// Reusing StatusBadge logic for Officer dashboard
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

const StatCard = ({ icon, label, value, color }) => (
  <div className="gov-card" style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '14px', borderTop: `3px solid ${color}` }}>
    <div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gov-text-light)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--gov-navy)', marginTop: '4px' }}>{value}</div>
    </div>
  </div>
);

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await officerService.getApplications();
        setApplications(res.data);
      } catch {
        setError('Failed to load applications. Please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Stats
  const total    = applications.length;
  const pending  = applications.filter(a => a.status === 'pending').length;
  const verifying = applications.filter(a => a.status === 'under_verification').length;
  const needInfo = applications.filter(a => a.status === 'need_info').length;
  const approved = applications.filter(a => a.status === 'approved').length;
  const rejected = applications.filter(a => a.status === 'rejected').length;

  // Chart data – recent 7 days
  const now = new Date();
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
  });
  
  const dayBuckets = dayLabels.map((label, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    return {
      name: label,
      count: applications.filter(a => new Date(a.application_date).toDateString() === dateStr).length,
    };
  });

  // Recent 5 applications
  const recentApps = [...applications]
    .sort((a, b) => new Date(b.application_date) - new Date(a.application_date))
    .slice(0, 5);

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
            Officer Dashboard
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
            Welcome back, <strong>{user?.full_name}</strong> — Overview of application queue and activities.
          </p>
        </div>
        <Link
          to="/officer/queue"
          className="gov-btn gov-btn-primary"
          style={{ fontSize: '13px', textDecoration: 'none' }}
        >
          View Full Queue
        </Link>
      </div>

      <ErrorAlert message={error} />

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <StatCard label="Total Applications" value={total} color="var(--gov-navy)" />
        <StatCard label="Pending" value={pending} color="var(--gov-orange)" />
        <StatCard label="Action Needed" value={needInfo} color="#B8860B" />
        <StatCard label="Approved" value={approved} color="#1A7A1A" />
        <StatCard label="Rejected" value={rejected} color="#C0392B" />
      </div>

      {/* Pending Banner */}
      {pending > 0 && (
        <div className="gov-alert gov-alert-warning" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            <strong>{pending} application{pending > 1 ? 's' : ''} awaiting your review.</strong> Timely processing helps farmers receive their subsidies faster.
          </span>
          <Link to="/officer/queue" className="gov-btn gov-btn-primary" style={{ fontSize: '12px', padding: '6px 14px', textDecoration: 'none' }}>
            Review Now
          </Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        
        {/* Chart */}
        <div className="gov-card">
          <div style={{ padding: '14px 20px', background: 'var(--gov-navy)', borderBottom: '2px solid var(--gov-orange)' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Applications Received (Last 7 Days)
            </h2>
          </div>
          <div style={{ padding: '20px' }}>
            {dayBuckets.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dayBuckets} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--gov-text-light)' }} axisLine={{ stroke: '#CCCCCC' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--gov-text-light)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '2px', border: '1px solid var(--gov-border)', fontSize: '13px' }}
                    cursor={{ fill: '#F4F4F4' }}
                  />
                  <Bar dataKey="count" name="Applications" radius={[2, 2, 0, 0]}>
                    {dayBuckets.map((_, i) => (
                      <Cell key={i} fill={i === 6 ? 'var(--gov-orange)' : 'var(--gov-navy)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8F8F8', border: '1px dashed var(--gov-border)' }}>
                <div style={{ marginBottom: '8px' }}></div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--gov-text-light)' }}>No applications received in the last 7 days.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="gov-card">
          <div style={{ padding: '14px 20px', background: 'var(--gov-navy)', borderBottom: '2px solid var(--gov-orange)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recent Activity
            </h2>
            <Link to="/officer/queue" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 600 }}>
              View All →
            </Link>
          </div>
          <div style={{ padding: '0' }}>
            {recentApps.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--gov-text-light)', fontSize: '13px' }}>
                No recent applications.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {recentApps.map((app) => (
                  <li key={app.id} style={{ borderBottom: '1px solid #E8E8E8' }}>
                    <Link
                      to={`/officer/application/${app.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        textDecoration: 'none', color: 'inherit', transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8F8F8'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gov-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          App #{app.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gov-text-light)', marginTop: '2px' }}>
                          {new Date(app.application_date).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <StatusBadge status={app.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
