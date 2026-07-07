import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

/**
 * Toast – a self-dismissing notification bubble.
 *
 * Props:
 *   message  (string)   – text to display
 *   type     ('success'|'error')  – colour variant
 *   onClose  (fn)       – called when toast should be removed
 *   duration (number)   – ms before auto-dismiss (default 3500)
 */
export const Toast = ({ message, type = 'success', onClose, duration = 3500 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const variants = {
    success: {
      bg: '#E8F5E9',
      border: '#A5D6A7',
      color: '#1A7A1A',
      icon: <CheckCircle size={16} />,
      label: 'SUCCESS',
    },
    error: {
      bg: '#FDECEA',
      border: '#FFCDD2',
      color: '#C0392B',
      icon: <XCircle size={16} />,
      label: 'ERROR',
    },
  };

  const v = variants[type] || variants.success;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '12px 14px',
      background: v.bg,
      border: `1px solid ${v.border}`,
      borderLeft: `4px solid ${v.color}`,
      borderRadius: '2px',
      boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
      minWidth: '280px',
      maxWidth: '380px',
      color: v.color,
      fontSize: '13px',
      fontWeight: 500,
      transition: 'all 0.3s',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
    }}>
      <span style={{ flexShrink: 0, marginTop: '1px' }}>{v.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
          {v.label}
        </div>
        <div style={{ fontSize: '13px' }}>{message}</div>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: v.color,
          opacity: 0.6,
          flexShrink: 0,
          padding: '0',
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};


/**
 * ToastContainer – renders a list of toasts in the bottom-right corner.
 */
export const ToastContainer = ({ toasts, remove }) => (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end',
    pointerEvents: 'none',
  }}>
    {toasts.map((t) => (
      <div key={t.id} style={{ pointerEvents: 'auto' }}>
        <Toast message={t.message} type={t.type} onClose={() => remove(t.id)} />
      </div>
    ))}
  </div>
);


/**
 * useToasts – hook for managing a toast list.
 */
export const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};
