import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Settings, Users, Shield,
  Map, Leaf, UserCircle, ClipboardList,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const role = user.role; // 'farmer', 'officer', 'admin'

  const links = {
    farmer: [
      { to: '/farmer/dashboard',           label: 'Dashboard',         icon: LayoutDashboard },
      { to: '/farmer/profile',             label: 'My Profile',        icon: UserCircle },
      { to: '/farmer/farm',                label: 'Farm Details',      icon: Map },
      { to: '/farmer/subsidies',           label: 'Eligible Subsidies',icon: Shield },
      { to: '/farmer/applications',        label: 'My Applications',   icon: FileText },
      { to: '/farmer/crop-recommendation', label: 'Crop ML',           icon: Leaf },
      { to: '/farmer/yield-prediction',    label: 'Yield ML',          icon: Settings },
    ],
    officer: [
      { to: '/officer/dashboard', label: 'Overview',           icon: LayoutDashboard },
      { to: '/officer/queue',     label: 'Application Queue',  icon: ClipboardList },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
      { to: '/admin/schemes',   label: 'Schemes & Rules', icon: Shield },
      { to: '/admin/users',     label: 'User Management', icon: Users },
    ],
  };

  const navLinks = links[role] || [];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-[calc(100vh-65px)] overflow-y-auto">
      <div className="px-3 py-4">
        <ul className="space-y-2 font-medium">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => 
                    `flex items-center p-2 rounded-lg transition-colors group ${
                      isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};
