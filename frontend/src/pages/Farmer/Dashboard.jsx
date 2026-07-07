import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FileText, ArrowRight, Brain, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const COLORS = {
  pending: '#eab308',
  under_verification: '#3b82f6',
  need_info: '#f97316',
  approved: '#22c55e',
  rejected: '#ef4444'
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
        
        // Calculate status distribution
        let pending = 0, approved = 0, rejected = 0, needInfo = 0, verifying = 0;
        apps.forEach(app => {
          if (app.status === 'pending') pending++;
          else if (app.status === 'approved') approved++;
          else if (app.status === 'rejected') rejected++;
          else if (app.status === 'need_info') needInfo++;
          else if (app.status === 'under_verification') verifying++;
        });

        setStats([
          { name: 'Pending', value: pending, fill: COLORS.pending },
          { name: 'Verifying', value: verifying, fill: COLORS.under_verification },
          { name: 'Action Needed', value: needInfo, fill: COLORS.need_info },
          { name: 'Approved', value: approved, fill: COLORS.approved },
          { name: 'Rejected', value: rejected, fill: COLORS.rejected },
        ].filter(s => s.value > 0)); // Only show non-zero in chart

      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
          <p className="text-gray-600 mt-1">Here is a quick overview of your farming activities and applications.</p>
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* Notifications Alert */}
      {unreadNotifications > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-orange-900">You have {unreadNotifications} unread notifications</h3>
              <p className="text-sm text-orange-700">Check your notifications for updates on your applications or required actions.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/farmer/subsidies" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md hover:border-green-200 transition-all group">
          <div className="bg-green-100 p-4 rounded-xl mr-5 group-hover:scale-105 transition-transform">
            <FileText className="text-green-600 w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">Government Subsidies</h3>
            <p className="text-sm text-gray-500 mt-0.5">Explore eligible schemes and apply</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
        </Link>
        <Link to="/farmer/smart-recommendation" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="bg-blue-100 p-4 rounded-xl mr-5 group-hover:scale-105 transition-transform">
            <Brain className="text-blue-600 w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Smart Crop Insights</h3>
            <p className="text-sm text-gray-500 mt-0.5">AI-powered recommendations & yield predictions</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </Link>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Application Status Overview</h2>
          <Link to="/farmer/applications" className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
        </div>
        
        {stats.length > 0 ? (
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="h-64 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats}
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend/Summary Panel */}
            <div className="w-full md:w-1/3 grid grid-cols-2 gap-4">
               {stats.map((stat, i) => (
                 <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.fill }}></div>
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{stat.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                 </div>
               ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-900">No applications yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6 text-center max-w-sm">
              You haven't applied for any subsidy schemes. Check your eligibility and apply to get benefits.
            </p>
            <Link to="/farmer/subsidies" className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm">
              Explore Schemes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
