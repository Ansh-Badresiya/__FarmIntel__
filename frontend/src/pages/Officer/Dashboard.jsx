import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { officerService } from '../../services/officerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import {
  FileText, Clock, CheckCircle, XCircle, TrendingUp,
  ArrowRight, AlertCircle, Activity, ClipboardList,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

/* ── helpers ────────────────────────────────────────────────────────────────── */
const statusColor = {
  pending:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  dot: 'bg-yellow-400'  },
  under_verification: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  need_info: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  approved: { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   dot: 'bg-green-500'   },
  rejected: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
};

const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className={`bg-white rounded-2xl border ${accent.border} shadow-sm p-5 flex items-start gap-4`}>
    <div className={`${accent.iconBg} p-3 rounded-xl`}>
      <Icon className={`w-6 h-6 ${accent.iconText}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-0.5 ${accent.valueText}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

/* ── component ──────────────────────────────────────────────────────────────── */
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-gray-500 mt-1">
            Here's a summary of your application queue and activity.
          </p>
        </div>
        <Link
          to="/officer/queue"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white
            text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
        >
          <ClipboardList className="w-4 h-4" />
          View Full Queue
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Activity}
          label="Total"
          value={total}
          accent={{ border: 'border-gray-200', iconBg: 'bg-gray-100', iconText: 'text-gray-600', valueText: 'text-gray-800' }}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={pending}
          accent={{ border: 'border-yellow-100', iconBg: 'bg-yellow-50', iconText: 'text-yellow-600', valueText: 'text-yellow-600' }}
        />
        <StatCard
          icon={AlertCircle}
          label="Action Needed"
          value={needInfo}
          accent={{ border: 'border-orange-100', iconBg: 'bg-orange-50', iconText: 'text-orange-600', valueText: 'text-orange-600' }}
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={approved}
          accent={{ border: 'border-green-100', iconBg: 'bg-green-50', iconText: 'text-green-600', valueText: 'text-green-600' }}
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={rejected}
          accent={{ border: 'border-red-100', iconBg: 'bg-red-50', iconText: 'text-red-600', valueText: 'text-red-600' }}
        />
      </div>

      {/* Charts + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">Applications – Last 7 Days</h2>
          </div>
          {dayBuckets.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayBuckets} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="count" name="Applications" radius={[6, 6, 0, 0]}>
                  {dayBuckets.map((_, i) => (
                    <Cell key={i} fill={i === 6 ? '#16a34a' : '#86efac'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <FileText className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No applications in the last 7 days</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Activity
            </h2>
            <Link to="/officer/queue" className="text-xs text-green-600 hover:underline font-medium">
              See all
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">
              No recent applications.
            </div>
          ) : (
            <ul className="space-y-3">
              {recentApps.map((app) => {
                const sc = statusColor[app.status] || statusColor.pending;
                return (
                  <li key={app.id}>
                    <Link
                      to={`/officer/application/${app.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${sc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          App #{app.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(app.application_date).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize
                        ${sc.bg} ${sc.text} border ${sc.border}`}>
                        {app.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Pending Banner */}
      {pending > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              {pending} application{pending > 1 ? 's' : ''} awaiting your review
            </p>
            <p className="text-sm text-amber-600 mt-0.5">
              Timely processing helps farmers receive their subsidies faster.
            </p>
          </div>
          <Link
            to="/officer/queue"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm
              font-semibold rounded-xl hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            Review Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
