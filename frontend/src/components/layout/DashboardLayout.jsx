import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../shared/Navbar';
import { Sidebar } from '../shared/Sidebar';

export const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
