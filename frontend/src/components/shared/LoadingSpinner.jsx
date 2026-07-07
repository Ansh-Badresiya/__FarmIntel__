import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ fullScreen = false }) => {
  const containerStyle = fullScreen
    ? {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.85)',
        zIndex: 50,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      };

  return (
    <div style={containerStyle}>
      <Loader2 size={32} style={{ color: 'var(--gov-orange)', animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--gov-text-light)', fontWeight: 500 }}>
        Loading...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
