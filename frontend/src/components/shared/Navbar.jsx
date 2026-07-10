import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, Lock, Bell, Check, ChevronDown, User } from 'lucide-react';
import api from '../../services/api';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      const fetchNotifs = async () => {
        try {
          const res = await api.get('/notifications/');
          setNotifications(res.data);
          setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (e) {
          console.error("Failed to load notifications", e);
        }
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const roleLabel = {
    farmer: 'Farmer Portal',
    officer: 'Officer Portal',
    admin: 'Admin Portal',
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40 }}>
      {/* Top Orange Strip */}
      <div className="gov-top-strip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 500 }}>
          FarmIntel — Smart Agriculture Decision Support System
        </span>
        {user && (
          <span style={{ fontSize: '12px' }}>
            Welcome, <strong>{user.full_name}</strong> &nbsp;|&nbsp;{' '}
            {roleLabel[user.role] || user.role}
          </span>
        )}
      </div>

      {/* Main White Navigation Bar */}
      <nav style={{
        background: '#fff',
        borderBottom: '3px solid var(--gov-orange)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '60px',
      }}>
        {/* Logo / Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            background: 'var(--gov-orange)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: '20px', lineHeight: 1 }}>🌾</span>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)', lineHeight: 1.1 }}>
              FarmIntel
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gov-text-light)', letterSpacing: '0.3px' }}>
              Agricultural Subsidy Management System
            </div>
          </div>
        </div>

        {/* Right side: notifications + profile */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  position: 'relative',
                  padding: '8px',
                  background: 'none',
                  border: '1px solid var(--gov-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'var(--gov-text-light)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'var(--gov-orange)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 4px)',
                  width: '340px',
                  background: '#fff',
                  border: '1px solid var(--gov-border)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                }}>
                  <div style={{
                    padding: '10px 14px',
                    borderBottom: '2px solid var(--gov-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--gov-navy)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{ fontSize: '12px', color: 'var(--gov-orange)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #F0F0F0',
                            background: notif.is_read ? '#fff' : '#FFF8F5',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: notif.is_read ? 'transparent' : 'var(--gov-orange)',
                            marginTop: '5px',
                            flexShrink: 0,
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gov-text)' }}>{notif.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--gov-text-light)', marginTop: '2px' }}>{notif.message}</div>
                            <div style={{ fontSize: '11px', color: 'var(--gov-text-muted)', marginTop: '3px' }}>
                              {new Date(notif.created_at).toLocaleString('en-IN')}
                            </div>
                          </div>
                          {!notif.is_read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              title="Mark as read"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gov-text-muted)', flexShrink: 0 }}
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--gov-text-muted)' }}>
                        No notifications yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: 'none',
                  border: '1px solid var(--gov-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--gov-text)',
                  fontWeight: 500,
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  background: 'var(--gov-navy)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <User size={16} color="#fff" />
                </div>
                <span className="hidden sm:inline" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.full_name}
                </span>
                <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: 'var(--gov-text-light)' }} />
              </button>

              {open && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 4px)',
                  width: '220px',
                  background: '#fff',
                  border: '1px solid var(--gov-border)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                }}>
                  {/* User Info */}
                  <div style={{
                    padding: '12px 14px',
                    borderBottom: '2px solid var(--gov-orange)',
                    background: 'var(--gov-navy)',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{user.full_name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      padding: '2px 8px',
                      background: 'var(--gov-orange)',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      textTransform: 'capitalize',
                    }}>
                      {user.role}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '4px 0' }}>
                    <Link
                      to="/settings/change-password"
                      onClick={() => setOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 14px',
                        fontSize: '13px',
                        color: 'var(--gov-text)',
                        textDecoration: 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F4F4F4'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <Lock size={14} style={{ color: 'var(--gov-text-light)' }} />
                      Change Password
                    </Link>
                    <button
                      onClick={() => { setOpen(false); logout(); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 14px',
                        fontSize: '13px',
                        color: '#C0392B',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FDECEA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
