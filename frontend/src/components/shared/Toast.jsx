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
    // Trigger CSS enter animation
    const show = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // wait for fade-out
    }, duration);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const base =
    'flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 min-w-[280px] max-w-sm';
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error:   'bg-red-50   border-red-200   text-red-800',
  };
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />,
    error:   <XCircle    className="w-5 h-5 text-red-500   shrink-0 mt-0.5" />,
  };

  return (
    <div
      className={`${base} ${variants[type]} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="text-current opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};


/**
 * ToastContainer – renders a list of toasts in the bottom-right corner.
 *
 * Props:
 *   toasts  (array)    – [{ id, message, type }]
 *   remove  (fn(id))   – called to delete a toast from the list
 */
export const ToastContainer = ({ toasts, remove }) => (
  <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
    {toasts.map((t) => (
      <div key={t.id} className="pointer-events-auto">
        <Toast message={t.message} type={t.type} onClose={() => remove(t.id)} />
      </div>
    ))}
  </div>
);


/**
 * useToasts – hook for managing a toast list.
 *
 * Returns { toasts, addToast, removeToast }
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
