import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FileText, Leaf, Sprout, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#eab308', '#22c55e', '#ef4444']; // Pending, Approved, Rejected

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await farmerService.getApplications();
        const apps = response.data;
        
        // Calculate status distribution
        let pending = 0, approved = 0, rejected = 0;
        apps.forEach(app => {
          if (app.status === 'pending') pending++;
          else if (app.status === 'approved') approved++;
          else if (app.status === 'rejected') rejected++;
        });

        setStats([
          { name: 'Pending', value: pending },
          { name: 'Approved', value: approved },
          { name: 'Rejected', value: rejected },
        ]);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
        <p className="text-gray-600">Here is a quick overview of your farming activities and applications.</p>
      </div>

      <ErrorAlert message={error} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/farmer/subsidies" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <FileText className="text-green-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Apply for Subsidy</h3>
            <p className="text-sm text-gray-500">View eligible schemes</p>
          </div>
        </Link>
        <Link to="/farmer/crop-recommendation" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <Leaf className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Crop Recommendation</h3>
            <p className="text-sm text-gray-500">AI-powered suggestions</p>
          </div>
        </Link>
        <Link to="/farmer/yield-prediction" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-amber-100 p-3 rounded-lg mr-4">
            <Sprout className="text-amber-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Yield Prediction</h3>
            <p className="text-sm text-gray-500">Estimate harvest</p>
          </div>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status Overview</h2>
        {stats.some(s => s.value > 0) ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500">No applications submitted yet.</p>
            <Link to="/farmer/subsidies" className="mt-2 text-green-600 font-medium hover:underline flex items-center">
              Find schemes to apply <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
