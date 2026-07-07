import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = {
  pending:  '#E8500A',
  under_verification: '#1A5C9C',
  need_info: '#B8860B',
  approved: '#1A7A1A',
  rejected: '#C0392B',
};

const StatCard = ({ icon, label, value, to, color }) => (
  <Link
    to={to}
    className="gov-card"
    style={{
      padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '14px', borderTop: `3px solid ${color}`,
      textDecoration: 'none', transition: 'background 0.15s'
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#F8F8F8'}
    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
  >
    <div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gov-text-light)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--gov-navy)', marginTop: '4px' }}>{value}</div>
    </div>
  </Link>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--gov-border)', padding: '8px 12px', fontSize: '13px', borderRadius: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--gov-navy)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ margin: 0, color: p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminService.getDashboardStats();
        setStats(res.data);
      } catch {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const appPieData = stats ? [
    { name: 'Pending',    value: stats.applications_pending,  color: COLORS.pending  },
    { name: 'Verifying', value: stats.applications_verifying || 0, color: COLORS.under_verification },
    { name: 'Approved',  value: stats.applications_approved, color: COLORS.approved },
    { name: 'Rejected',  value: stats.applications_rejected, color: COLORS.rejected },
  ] : [];

  const appBarData = appPieData.filter(d => d.value > 0);
  const totalApps = appPieData.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      {/* Header */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--gov-border)',
        borderLeft: '4px solid var(--gov-orange)',
        padding: '14px 18px',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--gov-navy)' }}>
          Admin Dashboard
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
          System overview and management portal for <strong>{user?.full_name}</strong>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="gov-alert gov-alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Stat Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <StatCard label="Farmers" value={stats.total_farmers} to="/admin/users" color="#1A5C9C" />
          <StatCard label="Active Schemes" value={stats.total_schemes} to="/admin/schemes" color="var(--gov-orange)" />
          <StatCard label="Field Officers" value={stats.total_officers ?? '—'} to="/admin/users" color="#1A7A1A" />
          <StatCard label="Pending Apps" value={stats.applications_pending} to="/admin/users" color="#B8860B" />
          <StatCard label="Total Apps" value={totalApps} to="/admin/users" color="var(--gov-navy)" />
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
          {/* Pie */}
          <div className="gov-card">
            <div style={{ padding: '14px 20px', background: 'var(--gov-navy)', borderBottom: '2px solid var(--gov-orange)' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Application Status Split
              </h2>
            </div>
            <div style={{ padding: '20px' }}>
              {totalApps > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={appPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {appPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="square"
                      iconSize={10}
                      formatter={(v) => <span style={{ fontSize: '12px', color: 'var(--gov-text)' }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--gov-text-muted)' }}>
                  No applications yet.
                </div>
              )}
            </div>
          </div>

          {/* Bar */}
          <div className="gov-card">
            <div style={{ padding: '14px 20px', background: 'var(--gov-navy)', borderBottom: '2px solid var(--gov-orange)' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Application Counts by Status
              </h2>
            </div>
            <div style={{ padding: '20px' }}>
              {appBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={appBarData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--gov-text-light)' }} axisLine={{ stroke: '#CCCCCC' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--gov-text-light)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F4F4' }} />
                    <Bar dataKey="value" name="Applications" radius={[2, 2, 0, 0]}>
                      {appBarData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--gov-text-muted)' }}>
                  No application data to display.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Nav */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {[
          { to: '/admin/users', title: 'User Management', desc: 'View all users and update roles', color: '#1A5C9C' },
          { to: '/admin/schemes', title: 'Subsidy Schemes', desc: 'Create, edit and deactivate schemes', color: 'var(--gov-orange)' },
          { to: '/admin/rules', title: 'Eligibility Rules', desc: 'Define rule logic per scheme', color: '#1A7A1A' },
        ].map(({ to, title, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="gov-card"
            style={{
              padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: `4px solid ${color}`,
              textDecoration: 'none', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8F8F8'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--gov-navy)', fontSize: '14px' }}>{title}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--gov-text-light)' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
