import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Users, Shield,
  Map, Leaf, UserCircle, ClipboardList, Settings, Brain
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const role = user.role;

  const links = {
    farmer: [
      { to: '/farmer/dashboard',            label: 'Dashboard',           icon: LayoutDashboard },
      { to: '/farmer/profile',              label: 'My Profile',          icon: UserCircle },
      { to: '/farmer/farm',                 label: 'Farm Details',        icon: Map },
      { to: '/farmer/subsidies',            label: 'Eligible Subsidies',  icon: Shield },
      { to: '/farmer/applications',         label: 'My Applications',     icon: FileText },
      { to: '/farmer/smart-recommendation', label: 'Smart Crop AI',       icon: Brain },
    ],
    officer: [
      { to: '/officer/dashboard', label: 'Overview',          icon: LayoutDashboard },
      { to: '/officer/queue',     label: 'Application Queue', icon: ClipboardList   },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard',          icon: LayoutDashboard },
      { to: '/admin/schemes',   label: 'Subsidy Schemes',    icon: Shield },
      { to: '/admin/rules',     label: 'Eligibility Rules',  icon: Settings },
      { to: '/admin/users',     label: 'User Management',    icon: Users },
    ],
  };

  const navLinks = links[role] || [];

  const roleLabels = {
    farmer: 'FARMER PORTAL',
    officer: 'OFFICER PORTAL',
    admin: 'ADMIN PORTAL',
  };

  return (
    <aside style={{
      width: '220px',
      background: '#fff',
      borderRight: '1px solid var(--gov-border)',
      height: 'calc(100vh - 88px)',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      {/* Role Indicator */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--gov-navy)',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}>
        {roleLabels[role] || 'PORTAL'}
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '8px 0' }}>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'gov-nav-link active' : 'gov-nav-link'
              }
            >
              <Icon size={16} />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom divider */}
      <div style={{ borderTop: '1px solid var(--gov-border)', margin: '8px 0' }} />

      {/* Settings link */}
      <NavLink
        to="/settings/change-password"
        className={({ isActive }) =>
          isActive ? 'gov-nav-link active' : 'gov-nav-link'
        }
        style={{ fontSize: '13px' }}
      >
        <Settings size={16} />
        <span style={{ fontSize: '13px', fontWeight: 500 }}>Settings</span>
      </NavLink>
    </aside>
  );
};
