import React from 'react';

export const ErrorAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div className="gov-alert gov-alert-error" style={{ marginBottom: '16px' }}>
      <span>{message}</span>
    </div>
  );
};
