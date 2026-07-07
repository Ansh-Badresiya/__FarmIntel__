import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

export const ChangePassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const newPassword = watch('new_password');

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setSuccess('Password changed successfully! Please use your new password next time you log in.');
      reset();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="gov-card">
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          background: 'var(--gov-navy)',
          borderBottom: '2px solid var(--gov-orange)',
        }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Change Password
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Keep your account secure with a strong password.
          </p>
        </div>

        <div style={{ padding: '24px 20px' }}>
          <ErrorAlert message={error} />

          {success && (
            <div className="gov-alert gov-alert-success" style={{ marginBottom: '20px' }}>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Current Password */}
            <div>
              <label className="gov-label">
                Current Password <span style={{ color: '#C0392B' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  {...register('current_password', { required: 'Current password is required' })}
                  className="gov-input"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--gov-text-muted)'
                  }}
                >
                  {showCurrent ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.current_password && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.current_password.message}</p>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--gov-border)', margin: '8px 0' }} />

            {/* New Password */}
            <div>
              <label className="gov-label">
                New Password <span style={{ color: '#C0392B' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  {...register('new_password', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  className="gov-input"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--gov-text-muted)'
                  }}
                >
                  {showNew ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.new_password && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.new_password.message}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="gov-label">
                Confirm New Password <span style={{ color: '#C0392B' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirm_password', {
                    required: 'Please confirm your new password',
                    validate: (value) =>
                      value === newPassword || 'Passwords do not match',
                  })}
                  className="gov-input"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--gov-text-muted)'
                  }}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirm_password && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.confirm_password.message}</p>
              )}
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: '16px', borderTop: '1px solid var(--gov-border)', marginTop: '8px'
            }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="gov-btn gov-btn-outline"
                style={{ fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="gov-btn gov-btn-primary"
                style={{ fontSize: '13px' }}
              >
                {isSubmitting ? 'Saving...' : 'Update Password'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
