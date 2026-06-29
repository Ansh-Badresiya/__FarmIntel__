import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages & Components
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PrivateRoute } from './components/shared/PrivateRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Farmer Pages
import { Dashboard as FarmerDashboard } from './pages/Farmer/Dashboard';
import { Profile as FarmerProfile } from './pages/Farmer/Profile';
import { FarmDetails } from './pages/Farmer/FarmDetails';
import { Subsidies as FarmerSubsidies } from './pages/Farmer/Subsidies';
import { ApplySubsidy } from './pages/Farmer/ApplySubsidy';
import { Applications as FarmerApplications } from './pages/Farmer/Applications';
import { CropRecommendation } from './pages/Farmer/CropRecommendation';
import { YieldPrediction } from './pages/Farmer/YieldPrediction';
import { ChangePassword } from './pages/settings/ChangePassword';

// Placeholder Pages for future modules
const Placeholder = ({ title }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
    <p className="text-gray-600">This module will be built in the next iterations.</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside Dashboard Layout */}
          <Route element={<DashboardLayout />}>
            
            {/* Farmer Routes */}
            <Route element={<PrivateRoute allowedRoles={['farmer']} />}>
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="/farmer/profile" element={<FarmerProfile />} />
              <Route path="/farmer/farm" element={<FarmDetails />} />
              <Route path="/farmer/subsidies" element={<FarmerSubsidies />} />
              <Route path="/farmer/apply/:schemeId" element={<ApplySubsidy />} />
              <Route path="/farmer/applications" element={<FarmerApplications />} />
              <Route path="/farmer/crop-recommendation" element={<CropRecommendation />} />
              <Route path="/farmer/yield-prediction" element={<YieldPrediction />} />
            </Route>

            {/* Officer Routes */}
            <Route element={<PrivateRoute allowedRoles={['officer', 'admin']} />}>
              <Route path="/officer/dashboard" element={<Placeholder title="Officer Dashboard" />} />
              <Route path="/officer/queue" element={<Placeholder title="Application Queue" />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<Placeholder title="Admin Dashboard" />} />
              <Route path="/admin/schemes" element={<Placeholder title="Schemes Management" />} />
              <Route path="/admin/users" element={<Placeholder title="User Management" />} />
            </Route>

            {/* Shared Settings Routes – accessible by ALL authenticated roles */}
            <Route element={<PrivateRoute allowedRoles={['farmer', 'officer', 'admin']} />}>
              <Route path="/settings/change-password" element={<ChangePassword />} />
            </Route>

          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
