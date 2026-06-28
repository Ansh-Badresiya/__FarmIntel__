import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages & Components
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PrivateRoute } from './components/shared/PrivateRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Placeholder Pages for routing setup
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
              <Route path="/farmer/dashboard" element={<Placeholder title="Farmer Dashboard" />} />
              <Route path="/farmer/applications" element={<Placeholder title="My Applications" />} />
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

          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
