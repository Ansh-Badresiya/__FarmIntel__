import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { officerService } from '../../services/officerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ActionModal } from '../../components/shared/ActionModal';
import { ToastContainer, useToasts } from '../../components/shared/Toast';

const statusMeta = {
  pending:  { label: 'Pending',  bg: 'status-pending' },
  under_verification: { label: 'Under Review', bg: 'status-under_verification' },
  need_info: { label: 'Action Required', bg: 'status-need_info' },
  approved: { label: 'Approved', bg: 'status-approved' },
  rejected: { label: 'Rejected', bg: 'status-rejected' },
};

const InfoRow = ({ label, value, mono = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 0', borderBottom: '1px solid var(--gov-border)' }}>
    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gov-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
    <span style={{ fontSize: '14px', color: 'var(--gov-text)', marginTop: '2px', fontFamily: mono ? 'monospace' : 'inherit' }}>
      {value ?? <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>}
    </span>
  </div>
);

const Section = ({ title, children, accentColor }) => (
  <div className="gov-card">
    <div style={{
      padding: '12px 16px',
      background: 'var(--gov-navy)',
      borderBottom: `3px solid ${accentColor}`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </h3>
    </div>
    <div style={{ padding: '0 16px' }}>
      {children}
    </div>
  </div>
);

export const ApplicationReview = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToasts();

  const [application, setApplication] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [modalMode, setModalMode]     = useState(null);

  const fetchApp = useCallback(async () => {
    setLoading(true);
    try {
      const res = await officerService.getApplicationDetail(applicationId);
      setApplication(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load application details.');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => { fetchApp(); }, [fetchApp]);

  const handleAction = async (formData) => {
    try {
      if (modalMode === 'approve') {
        await officerService.approveApplication(applicationId, formData.notes || '');
        addToast('Application approved successfully!', 'success');
      } else if (modalMode === 'reject') {
        await officerService.rejectApplication(applicationId, formData.reason);
        addToast('Application rejected.', 'success');
      } else if (modalMode === 'request-docs') {
        await officerService.requestDocuments(applicationId, formData.document_request);
        addToast('Document request sent to farmer.', 'success');
      }
      await fetchApp();
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Action failed. Please try again.';
      addToast(msg, 'error');
      throw e;
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div>
        <Link to="/officer/queue" className="gov-btn gov-btn-outline" style={{ marginBottom: '20px', fontSize: '13px', textDecoration: 'none' }}>
          ← Back to Queue
        </Link>
        <div className="gov-alert gov-alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const { farmer, scheme, status, application_date, decision_date, notes, farm } = application;
  const sm = statusMeta[status] || statusMeta.pending;
  const isPending = status === 'pending' || status === 'under_verification';

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />
      <ActionModal mode={modalMode} onClose={() => setModalMode(null)} onSubmit={handleAction} />

      <div>
        {/* Breadcrumb & Actions */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--gov-border)',
          borderLeft: '4px solid var(--gov-orange)',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => navigate(-1)}
                className="gov-btn gov-btn-outline"
                style={{ padding: '6px 10px', fontSize: '12px' }}
              >
                ← Back
              </button>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--gov-navy)' }}>
                Application Review
              </h1>
              <span className={`status-badge ${sm.bg}`}>
                {sm.label}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--gov-text-light)', marginLeft: '60px' }}>
              ID: <strong>#{applicationId.slice(0, 8).toUpperCase()}</strong> | Submitted:{' '}
              {new Date(application_date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>

          {/* Action Buttons */}
          {(isPending || status === 'need_info') && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setModalMode('approve')}
                className="gov-btn"
                style={{ background: '#1A7A1A', color: '#fff', fontSize: '13px' }}
              >
                Approve
              </button>
              <button
                onClick={() => setModalMode('request-docs')}
                className="gov-btn"
                style={{ background: '#B8860B', color: '#fff', fontSize: '13px' }}
              >
                Request Info
              </button>
              <button
                onClick={() => setModalMode('reject')}
                className="gov-btn gov-btn-danger"
                style={{ fontSize: '13px' }}
              >
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Status Notice */}
        {status === 'need_info' && (
          <div className="gov-alert gov-alert-warning" style={{ marginBottom: '20px' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '13px' }}>Waiting on farmer for additional information.</p>
              <p style={{ margin: '2px 0 0', fontSize: '13px' }}>Request Details: {notes}</p>
            </div>
          </div>
        )}

        {status === 'approved' || status === 'rejected' ? (
          <div className={`gov-alert ${status === 'approved' ? 'gov-alert-success' : 'gov-alert-error'}`} style={{ marginBottom: '20px' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '13px' }}>This application has been {status}.</p>
              {decision_date && (
                <p style={{ margin: '2px 0 0', fontSize: '12px' }}>
                  Decision Date: {new Date(decision_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          
          <Section icon="👤" title="Farmer Profile" accentColor="#1A5C9C">
            <InfoRow label="Full Name"     value={farmer.user?.full_name} />
            <InfoRow label="Aadhaar No"    value={farmer.aadhar_number} mono />
            <InfoRow label="Father Name"   value={farmer.father_name} />
            <InfoRow label="Category"      value={farmer.category} />
            <InfoRow label="Gender"        value={farmer.gender} />
            <InfoRow label="DOB / Age"     value={`${farmer.date_of_birth} (${farmer.age} years)`} />
            <InfoRow label="Annual Income" value={farmer.annual_income ? `₹${farmer.annual_income.toLocaleString('en-IN')}` : null} />
            <InfoRow label="Phone Number"  value={farmer.phone_number} mono />
          </Section>

          <Section icon="🚜" title="Farm & Cultivation Details" accentColor="#1A7A1A">
            {farm ? (
              <>
                <InfoRow label="Land Area"      value={`${farm.land_area} Hectares`} />
                <InfoRow label="Ownership"      value={farm.ownership_type} />
                <InfoRow label="Soil Type"      value={farm.soil_type} />
                <InfoRow label="Irrigation"     value={farm.irrigation_type} />
                <InfoRow label="Water Source"   value={farm.water_source} />
                <InfoRow label="Crop Category"  value={farm.crop_category} />
                <InfoRow label="Crop Type"      value={farm.crop_type} />
              </>
            ) : (
              <div style={{ padding: '20px 0', fontSize: '13px', color: 'var(--gov-text-muted)', fontStyle: 'italic' }}>
                No farm details provided.
              </div>
            )}
          </Section>

          <Section icon="🏛️" title="Scheme Details" accentColor="var(--gov-orange)">
            <InfoRow label="Scheme Name"   value={scheme.scheme_name} />
            <InfoRow label="Subsidy Amount"
              value={
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A7A1A' }}>
                  ₹{scheme.subsidy_amount.toLocaleString('en-IN')}
                </span>
              }
            />
            <InfoRow label="Scheme ID"     value={scheme.id} mono />
            <InfoRow label="Department"    value={scheme.department} />
            <InfoRow label="Sector"        value={scheme.sector} />
            <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 0' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gov-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>
              <span style={{ fontSize: '13px', color: 'var(--gov-text)', marginTop: '2px', lineHeight: 1.5 }}>
                {scheme.description}
              </span>
            </div>
          </Section>

          <Section icon="📝" title="Officer Notes / Remarks" accentColor="#666">
            {notes ? (
              <div style={{ padding: '16px 0' }}>
                <div style={{ background: '#F8F8F8', border: '1px solid var(--gov-border)', padding: '12px', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {notes}
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px 0', fontSize: '13px', color: 'var(--gov-text-muted)', fontStyle: 'italic' }}>
                No remarks recorded yet.
              </div>
            )}
            <InfoRow label="Assigned Officer" value={application.assigned_officer || 'Unassigned'} mono />
          </Section>

        </div>
      </div>
    </>
  );
};
