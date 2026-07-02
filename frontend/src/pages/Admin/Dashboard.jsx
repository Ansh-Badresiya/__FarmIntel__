import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import {
  Users, FileText, Shield, CheckCircle, XCircle, Clock,
  TrendingUp, AlertCircle, ArrowRight, BarChart2, Settings,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

/* ── palette ─────────────────────────────────────────────────────────────── */
const COLORS = {
  pending:  '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
};

/* ── sub-components ─────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, to, accent }) => (
  <Link
    to={to}
    className={`group bg-white rounded-2xl border ${accent.border} shadow-sm p-5
      flex items-start gap-4 hover:shadow-md transition-shadow`}
  >
    <div className={`${accent.iconBg} p-3 rounded-xl`}>
      <Icon className={`w-6 h-6 ${accent.iconText}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-0.5 ${accent.valueText}`}>{value}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 mt-1 transition-colors" />
  </Link>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }} className="mt-0.5">
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ── page ───────────────────────────────────────────────────────────────── */
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
    { name: 'Pending',  value: stats.applications_pending,  color: COLORS.pending  },
    { name: 'Approved', value: stats.applications_approved, color: COLORS.approved },
    { name: 'Rejected', value: stats.applications_rejected, color: COLORS.rejected },
  ] : [];

  const appBarData = appPieData.filter(d => d.value > 0);
  const totalApps = appPieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          System overview for <span className="font-semibold text-gray-700">{user?.full_name}</span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Registered Farmers"
            value={stats.total_farmers}
            to="/admin/users"
            accent={{ border: 'border-blue-100', iconBg: 'bg-blue-50', iconText: 'text-blue-600', valueText: 'text-blue-700' }}
          />
          <StatCard
            icon={Shield}
            label="Active Schemes"
            value={stats.total_schemes}
            to="/admin/schemes"
            accent={{ border: 'border-purple-100', iconBg: 'bg-purple-50', iconText: 'text-purple-600', valueText: 'text-purple-700' }}
          />
          <StatCard
            icon={Clock}
            label="Applications Pending"
            value={stats.applications_pending}
            to="/admin/users"
            accent={{ border: 'border-yellow-100', iconBg: 'bg-yellow-50', iconText: 'text-yellow-600', valueText: 'text-yellow-600' }}
          />
          <StatCard
            icon={TrendingUp}
            label="Total Applications"
            value={totalApps}
            to="/admin/users"
            accent={{ border: 'border-green-100', iconBg: 'bg-green-50', iconText: 'text-green-600', valueText: 'text-green-700' }}
          />
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Pie */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Application Status Split
            </h2>
            {totalApps > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={appPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {appPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    formatter={(v) => <span className="text-sm text-gray-600">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                No applications yet.
              </div>
            )}
          </div>

          {/* Bar */}
          <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-green-500" />
              Application Counts by Status
            </h2>
            {appBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={appBarData} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="value" name="Applications" radius={[8, 8, 0, 0]}>
                    {appBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                No application data to display.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Nav */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            to: '/admin/users',
            icon: Users,
            title: 'User Management',
            desc: 'View all users and update roles',
            color: 'blue',
          },
          {
            to: '/admin/schemes',
            icon: Shield,
            title: 'Subsidy Schemes',
            desc: 'Create, edit and deactivate schemes',
            color: 'purple',
          },
          {
            to: '/admin/rules',
            icon: Settings,
            title: 'Eligibility Rules',
            desc: 'Define rule logic per scheme',
            color: 'amber',
          },
        ].map(({ to, icon: Icon, title, desc, color }) => {
          const c = {
            blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100'   },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
            amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100'  },
          }[color];
          return (
            <Link
              key={to}
              to={to}
              className={`group bg-white border ${c.border} rounded-2xl p-5 flex items-center gap-4
                hover:shadow-md transition-shadow`}
            >
              <div className={`${c.bg} p-3 rounded-xl`}>
                <Icon className={`w-6 h-6 ${c.text}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-600 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
