import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FileText, ArrowRight, Brain, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const COLORS = {
  pending: '#E8500A',
  under_verification: '#1A5C9C',
  need_info: '#B8860B',
  approved: '#1A7A1A',
  rejected: '#C0392B'
};

// Status badge helper
const StatusBadge = ({ status }) => {
  const cls = {
    pending: 'status-pending',
    under_verification: 'status-under_verification',
    approved: 'status-approved',
    rejected: 'status-rejected',
    need_info: 'status-need_info',
  }[status] || 'status-pending';
  
  const labels = {
    pending: 'Pending',
    under_verification: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    need_info: 'Action Needed',
  };

  return <span className={`status-badge ${cls}`}>{labels[status] || status}</span>;
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appsRes, notifRes] = await Promise.all([
          farmerService.getApplications(),
          api.get('/notifications/unread-count').catch(() => ({ data: { unread: 0 } }))
        ]);
        
        const apps = appsRes.data;
        if (notifRes.data) {
          setUnreadNotifications(notifRes.data.unread);
        }
        
        let pending = 0, approved = 0, rejected = 0, needInfo = 0, verifying = 0;
        apps.forEach(app => {
          if (app.status === 'pending') pending++;
          else if (app.status === 'approved') approved++;
          else if (app.status === 'rejected') rejected++;
          else if (app.status === 'need_info') needInfo++;
          else if (app.status === 'under_verification') verifying++;
        });

        setStats([
          { name: 'Pending',       value: pending,   fill: COLORS.pending },
          { name: 'Under Review',  value: verifying, fill: COLORS.under_verification },
          { name: 'Action Needed', value: needInfo,  fill: COLORS.need_info },
          { name: 'Approved',      value: approved,  fill: COLORS.approved },
          { name: 'Rejected',      value: rejected,  fill: COLORS.rejected },
        ].filter(s => s.value > 0));

      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalApps = stats.reduce((sum, s) => sum + s.value, 0);

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
            Farmer Dashboard
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
            Welcome, <strong>{user?.full_name}</strong> — Overview of your farming activities and applications.
          </p>
        </div>
        <Link
          to="/farmer/subsidies"
          className="gov-btn gov-btn-primary"
          style={{ textDecoration: 'none', fontSize: '13px' }}
        >
          Browse Schemes
        </Link>
      </div>

      <ErrorAlert message={error} />

      {/* Notification Alert */}
      {unreadNotifications > 0 && (
        <div className="gov-alert gov-alert-warning" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>
            <strong>You have {unreadNotifications} unread notification{unreadNotifications > 1 ? 's' : ''}.</strong>{' '}
            Check the bell icon in the top navigation for updates on your applications.
          </span>
        </div>
      )}

      {/* Quick Action Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <Link
          to="/farmer/subsidies"
          style={{ textDecoration: 'none' }}
        >
          <div style={{
            background: '#fff',
            border: '1px solid var(--gov-border)',
            borderTop: '3px solid var(--gov-orange)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontSize: '14px' }}>Subsidies</div>
              <div style={{ fontSize: '12px', color: 'var(--gov-text-light)', marginTop: '2px' }}>Explore eligible schemes and apply</div>
            </div>
            <ArrowRight size={16} color="var(--gov-orange)" />
          </div>
        </Link>

        <Link
          to="/farmer/applications"
          style={{ textDecoration: 'none' }}
        >
          <div style={{
            background: '#fff',
            border: '1px solid var(--gov-border)',
            borderTop: '3px solid var(--gov-navy)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontSize: '14px' }}>My Applications</div>
              <div style={{ fontSize: '12px', color: 'var(--gov-text-light)', marginTop: '2px' }}>Track status of your subsidy applications</div>
            </div>
            <ArrowRight size={16} color="var(--gov-navy)" />
          </div>
        </Link>

        <Link
          to="/farmer/smart-recommendation"
          style={{ textDecoration: 'none' }}
        >
          <div style={{
            background: '#fff',
            border: '1px solid var(--gov-border)',
            borderTop: '3px solid #1A7A1A',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontSize: '14px' }}>Smart Crop Advisory</div>
              <div style={{ fontSize: '12px', color: 'var(--gov-text-light)', marginTop: '2px' }}>AI-powered crop & yield recommendations</div>
            </div>
            <ArrowRight size={16} color="#1A7A1A" />
          </div>
        </Link>

        <Link
          to="/farmer/profile"
          style={{ textDecoration: 'none' }}
        >
          <div style={{
            background: '#fff',
            border: '1px solid var(--gov-border)',
            borderTop: '3px solid #1A5C9C',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontSize: '14px' }}>My Profile</div>
              <div style={{ fontSize: '12px', color: 'var(--gov-text-light)', marginTop: '2px' }}>Update personal & bank details</div>
            </div>
            <ArrowRight size={16} color="#1A5C9C" />
          </div>
        </Link>
      </div>

      {/* Application Status Overview */}
      <div className="gov-card">
        <div style={{
          padding: '12px 16px',
          borderBottom: '2px solid var(--gov-orange)',
          background: 'var(--gov-navy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Application Status Overview
          </h2>
          <Link
            to="/farmer/applications"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 600 }}
          >
            View All →
          </Link>
        </div>
        <div style={{ padding: '20px' }}>
          {stats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
              {/* Chart */}
              <div style={{ height: '220px', width: '220px', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats}
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '2px', border: '1px solid var(--gov-border)', fontSize: '13px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Table */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <table className="gov-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stat.fill, flexShrink: 0 }} />
                            {stat.name}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '15px', color: stat.fill }}>
                          {stat.value}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ fontWeight: 700 }}>Total</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '15px' }}>{totalApps}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              background: '#FAFAFA',
              border: '1px dashed var(--gov-border)',
            }}>
              <div style={{ marginBottom: '12px' }}></div>
              <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600, color: 'var(--gov-text)' }}>
                No Applications Yet
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--gov-text-light)', marginBottom: '16px', maxWidth: '340px', margin: '0 auto 16px' }}>
                You haven't applied for any subsidy schemes. Check your eligibility and apply to receive government benefits.
              </p>
              <Link to="/farmer/subsidies" className="gov-btn gov-btn-primary" style={{ textDecoration: 'none' }}>
                Explore Schemes
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
