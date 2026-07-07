import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

export const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  const onSubmit = async (data) => {
    try {
      setError('');
      const loggedInUser = await login(data.email, data.password);
      navigate(`/${loggedInUser.role}/dashboard`);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gov-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Orange Strip */}
      <div className="gov-top-strip" style={{ textAlign: 'center' }}>
        FarmIntel — Smart Agriculture Decision Support System
      </div>

      {/* Header Banner */}
      <div style={{
        background: 'var(--gov-navy)',
        padding: '20px 0',
        textAlign: 'center',
        borderBottom: '4px solid var(--gov-orange)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'var(--gov-orange)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}>
            🌾
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
              FarmIntel
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
              Agricultural Subsidy Management System
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
        }}>
          {/* Form Card */}
          <div className="gov-card" style={{ overflow: 'hidden' }}>
            {/* Card Header */}
            <div style={{
              background: 'var(--gov-navy)',
              padding: '14px 20px',
              borderBottom: '2px solid var(--gov-orange)',
            }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📋 Farmer Login
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                Sign in to access your account
              </p>
            </div>

            {/* Form Body */}
            <div style={{ padding: '24px 20px' }}>
              <ErrorAlert message={error} />

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="gov-form-group">
                  <label className="gov-label">Email Address <span style={{ color: '#C0392B' }}>*</span></label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="gov-input"
                    placeholder="Enter registered email"
                    id="login-email"
                  />
                  {errors.email && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.email.message}</p>}
                </div>

                <div className="gov-form-group">
                  <label className="gov-label">Password <span style={{ color: '#C0392B' }}>*</span></label>
                  <input
                    type="password"
                    {...register('password', { required: 'Password is required' })}
                    className="gov-input"
                    placeholder="Enter password"
                    id="login-password"
                  />
                  {errors.password && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B' }}>{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gov-btn gov-btn-primary"
                  id="login-submit"
                  style={{ width: '100%', padding: '10px', fontSize: '14px', marginTop: '4px' }}
                >
                  {isSubmitting ? '⏳ Signing in...' : '🔐 Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div style={{ margin: '20px 0', borderTop: '1px solid var(--gov-border)', position: 'relative', textAlign: 'center' }}>
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#fff',
                  padding: '0 12px',
                  fontSize: '12px',
                  color: 'var(--gov-text-muted)',
                }}>
                  New User?
                </span>
              </div>

              <Link
                to="/register"
                className="gov-btn gov-btn-outline"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '8px', textDecoration: 'none' }}
              >
                Register as Farmer
              </Link>
            </div>
          </div>

          {/* Notice */}
          <div style={{
            marginTop: '16px',
            padding: '12px 14px',
            background: '#FFF8E1',
            border: '1px solid #FFE082',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#7B6000',
          }}>
            <strong>📌 Note:</strong> This portal is only for registered farmers, field officers, and administrators. 
            For assistance, contact your local agriculture department.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: 'var(--gov-navy)',
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        padding: '12px',
        fontSize: '12px',
      }}>
        © FarmIntel. All Rights Reserved. | v1.0
      </div>
    </div>
  );
};
