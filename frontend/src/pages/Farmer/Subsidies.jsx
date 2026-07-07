import React, { useEffect, useState } from 'react';
import { farmerService } from '../../services/farmerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export const Subsidies = () => {
  const [allSubsidies, setAllSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('eligible');
  const navigate = useNavigate();

  useEffect(() => {
    const loadSubsidies = async () => {
      try {
        const res = await farmerService.getAllSubsidies();
        setAllSubsidies(res.data);
      } catch (err) {
        setError('Failed to load subsidies.');
      } finally {
        setLoading(false);
      }
    };
    loadSubsidies();
  }, []);

  const handleApply = async (schemeId) => {
    try {
      await farmerService.applySubsidy(schemeId);
      navigate('/farmer/applications');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply for subsidy.');
      window.scrollTo(0, 0);
    }
  };

  if (loading) return <LoadingSpinner />;

  const eligibleSubsidies = allSubsidies.filter(s => s.is_eligible);
  const displayedSubsidies = activeTab === 'eligible' ? eligibleSubsidies : allSubsidies;

  return (
    <div>
      {/* Page Header */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--gov-border)',
        borderLeft: '4px solid var(--gov-orange)',
        padding: '14px 18px',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--gov-navy)' }}>
          Government Subsidy Schemes
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--gov-text-light)' }}>
          Explore and apply for agricultural schemes and benefits. Eligibility is determined based on your profile.
        </p>
      </div>

      <ErrorAlert message={error} />

      {/* Tab Bar */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--gov-border)',
        borderBottom: '2px solid var(--gov-border)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex' }}>
          {[
            { key: 'eligible', label: 'Eligible Schemes', count: eligibleSubsidies.length },
            { key: 'all', label: 'All Schemes', count: allSubsidies.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 20px',
                background: activeTab === tab.key ? 'var(--gov-orange)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--gov-text)',
                border: 'none',
                borderRight: '1px solid var(--gov-border)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.15s',
              }}
            >
              {tab.label}
              <span style={{
                background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : 'var(--gov-bg)',
                color: activeTab === tab.key ? '#fff' : 'var(--gov-text)',
                padding: '1px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 700,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Schemes List */}
      {displayedSubsidies.length === 0 ? (
        <div className="gov-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ marginBottom: '12px' }}></div>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--gov-navy)' }}>No Schemes Found</h3>
          <p style={{ fontSize: '13px', color: 'var(--gov-text-light)', maxWidth: '400px', margin: '0 auto 16px' }}>
            {activeTab === 'eligible'
              ? 'You are not currently eligible for any active schemes based on your profile. Update your profile or farm details to check eligibility.'
              : 'There are currently no active government schemes available.'}
          </p>
          {activeTab === 'eligible' && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link to="/farmer/profile" className="gov-btn gov-btn-primary" style={{ textDecoration: 'none' }}>
                Update Profile
              </Link>
              <Link to="/farmer/farm" className="gov-btn gov-btn-outline" style={{ textDecoration: 'none' }}>
                Update Farm Details
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {displayedSubsidies.map((item) => {
            const { scheme, is_eligible, ineligible_reasons, already_applied, application_status } = item;
            
            return (
              <div key={scheme.id} className="gov-card" style={{
                borderLeft: `4px solid ${already_applied ? '#1A5C9C' : is_eligible ? '#1A7A1A' : '#CCCCCC'}`,
                opacity: (!is_eligible && !already_applied) ? 0.9 : 1,
              }}>
                <div style={{ padding: '16px 18px' }}>
                  {/* Scheme Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--gov-navy)' }}>
                          {scheme.scheme_name}
                        </h3>
                        {already_applied ? (
                          <span className="status-badge status-review">Applied</span>
                        ) : is_eligible ? (
                          <span className="status-badge status-approved">Eligible</span>
                        ) : (
                          <span className="status-badge status-expired">Not Eligible</span>
                        )}
                      </div>
                      {scheme.department && (
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--gov-text-muted)' }}>
                          Department: {scheme.department}
                        </p>
                      )}
                    </div>
                    <div style={{
                      background: 'var(--gov-orange)',
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      ₹{scheme.subsidy_amount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Description */}
                  {scheme.description && (
                    <p style={{ fontSize: '13px', color: 'var(--gov-text-light)', margin: '0 0 12px', lineHeight: '1.5' }}>
                      {scheme.description}
                    </p>
                  )}

                  {/* Scheme Details Row */}
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {scheme.application_deadline && (
                      <div style={{ fontSize: '12px', color: 'var(--gov-text-light)' }}>
                        <strong>Deadline:</strong> {new Date(scheme.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                    {scheme.applicable_seasons?.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--gov-text-light)' }}>
                        <strong>Season:</strong> {scheme.applicable_seasons.join(', ')}
                      </div>
                    )}
                    {scheme.max_beneficiaries && (
                      <div style={{ fontSize: '12px', color: 'var(--gov-text-light)' }}>
                        <strong>Max Beneficiaries:</strong> {scheme.max_beneficiaries.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  {/* Status / Eligibility Messages */}
                  {already_applied ? (
                    <div className="gov-alert gov-alert-info">
                      <Info size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ fontSize: '13px' }}>
                        Your application has been submitted. Current Status:{' '}
                        <strong style={{ textTransform: 'uppercase' }}>{application_status}</strong>
                      </span>
                    </div>
                  ) : !is_eligible && ineligible_reasons?.length > 0 ? (
                    <div className="gov-alert gov-alert-error">
                      <XCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Ineligibility Reasons:</div>
                        <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px' }}>
                          {ineligible_reasons.slice(0, 3).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                          {ineligible_reasons.length > 3 && <li>+{ineligible_reasons.length - 3} more reasons</li>}
                        </ul>
                      </div>
                    </div>
                  ) : null}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--gov-border)' }}>
                    {already_applied ? (
                      <Link
                        to="/farmer/applications"
                        className="gov-btn gov-btn-secondary"
                        style={{ textDecoration: 'none', fontSize: '13px' }}
                      >
                        View Application Status
                      </Link>
                    ) : is_eligible ? (
                      <button
                        onClick={() => handleApply(scheme.id)}
                        className="gov-btn gov-btn-primary"
                        style={{ fontSize: '13px' }}
                      >
                        Apply Now
                      </button>
                    ) : (
                      <button
                        disabled
                        className="gov-btn"
                        style={{ background: '#E0E0E0', color: '#888', cursor: 'not-allowed', fontSize: '13px' }}
                      >
                        Not Eligible
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
