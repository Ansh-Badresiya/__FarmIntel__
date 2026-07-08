import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FileText, ArrowRight, Brain, AlertCircle, UserCheck, Home, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding Banner — shown when no farmer profile exists yet
// ─────────────────────────────────────────────────────────────────────────────
const OnboardingBanner = ({ userName }) => (
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
          Welcome, <strong>{userName}</strong> — Let's get your account set up.
        </p>
      </div>
    </div>

    {/* Onboarding Notice */}
    <div style={{
      background: '#FFF8E1',
      border: '1px solid #FFE082',
      borderLeft: '4px solid #F59E0B',
      borderRadius: '4px',
      padding: '16px 20px',
      marginBottom: '24px',
      display: 'flex',
      gap: '14px',
      alignItems: 'flex-start',
    }}>
      <AlertCircle size={20} style={{ color: '#B45309', flexShrink: 0, marginTop: '1px' }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#92400E', marginBottom: '4px' }}>
          Farmer Profile Not Yet Created
        </div>
        <div style={{ fontSize: '13px', color: '#78350F', lineHeight: '1.5' }}>
          Please complete your farmer profile to access dashboard features, check scheme eligibility,
          and submit subsidy applications.
        </div>
      </div>
    </div>

    {/* Onboarding Steps */}
    <div className="gov-card" style={{ overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{
        background: 'var(--gov-navy)',
        borderBottom: '2px solid var(--gov-orange)',
        padding: '12px 18px',
      }}>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Getting Started — Complete Your Onboarding
        </h2>
      </div>
      <div style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Step 1 */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--gov-orange)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '16px',
              }}>1</div>
              <div style={{ width: '2px', height: '40px', background: 'var(--gov-border)', margin: '4px 0' }} />
            </div>
            <div style={{ paddingTop: '6px', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--gov-navy)', marginBottom: '2px' }}>
                Complete Farmer Profile
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gov-text-light)', marginBottom: '12px' }}>
                Provide your Aadhaar number, address, income details, and bank information for subsidy eligibility checks.
              </div>
              <Link to="/farmer/profile" className="gov-btn gov-btn-primary" style={{ textDecoration: 'none', fontSize: '13px', display: 'inline-block' }}>
                Complete Profile →
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#D1D5DB', color: '#6B7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '16px',
              }}>2</div>
              <div style={{ width: '2px', height: '40px', background: 'var(--gov-border)', margin: '4px 0' }} />
            </div>
            <div style={{ paddingTop: '6px', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#6B7280', marginBottom: '2px' }}>
                Add Farm Details
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gov-text-light)', marginBottom: '12px' }}>
                Enter land area, soil type, irrigation method, and current crops to improve eligibility matching.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#D1D5DB', color: '#6B7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '16px',
              }}>3</div>
            </div>
            <div style={{ paddingTop: '6px', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#6B7280', marginBottom: '2px' }}>
                Browse &amp; Apply for Schemes
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gov-text-light)' }}>
                View eligible government subsidy schemes and submit applications directly from the dashboard.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    {/* Info Panel */}
    <div style={{
      padding: '14px 16px',
      background: '#F0F7FF',
      border: '1px solid #BFDBFE',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#1E40AF',
    }}>
      <strong>📌 Why is this required?</strong> Your Aadhaar number and other details are used to verify
      eligibility for Central and State government subsidy schemes under the PM-KISAN, PMFBY,
      and other agricultural welfare programmes.
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ── Step 1: Check if farmer profile exists ─────────────────────────
        try {
          await farmerService.getProfile();
        } catch (profileErr) {
          if (profileErr.response?.status === 404) {
            // No profile yet — show onboarding, don't load the rest
            setProfileMissing(true);
            setLoading(false);
            return;
          }
          // Unexpected error — re-throw
          throw profileErr;
        }

        // ── Step 2: Profile exists — load dashboard data ───────────────────
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

  // ── Onboarding state — no profile yet ──────────────────────────────────────
  if (profileMissing) {
    return <OnboardingBanner userName={user?.full_name} />;
  }

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
        <Link to="/farmer/subsidies" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#fff', border: '1px solid var(--gov-border)',
            borderTop: '3px solid var(--gov-orange)', padding: '16px',
            display: 'flex', alignItems: 'center', gap: '14px',
            cursor: 'pointer', transition: 'box-shadow 0.15s',
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

        <Link to="/farmer/applications" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#fff', border: '1px solid var(--gov-border)',
            borderTop: '3px solid var(--gov-navy)', padding: '16px',
            display: 'flex', alignItems: 'center', gap: '14px',
            cursor: 'pointer', transition: 'box-shadow 0.15s',
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

        <Link to="/farmer/smart-recommendation" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#fff', border: '1px solid var(--gov-border)',
            borderTop: '3px solid #1A7A1A', padding: '16px',
            display: 'flex', alignItems: 'center', gap: '14px',
            cursor: 'pointer', transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontSize: '14px' }}>Smart Crop Advisory</div>
              <div style={{ fontSize: '12px', color: 'var(--gov-text-light)', marginTop: '2px' }}>AI-powered crop &amp; yield recommendations</div>
            </div>
            <ArrowRight size={16} color="#1A7A1A" />
          </div>
        </Link>

        <Link to="/farmer/profile" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#fff', border: '1px solid var(--gov-border)',
            borderTop: '3px solid #1A5C9C', padding: '16px',
            display: 'flex', alignItems: 'center', gap: '14px',
            cursor: 'pointer', transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontSize: '14px' }}>My Profile</div>
              <div style={{ fontSize: '12px', color: 'var(--gov-text-light)', marginTop: '2px' }}>Update personal &amp; bank details</div>
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
