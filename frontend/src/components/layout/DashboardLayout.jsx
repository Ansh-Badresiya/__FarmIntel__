import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../shared/Navbar';
import { Sidebar } from '../shared/Sidebar';

export const DashboardLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--gov-bg)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          background: 'var(--gov-bg)',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
