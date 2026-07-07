import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { officerService } from '../../services/officerService';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ActionModal } from '../../components/shared/ActionModal';
import { ToastContainer, useToasts } from '../../components/shared/Toast';
import {
  ArrowLeft, User, MapPin, Landmark, FileText,
  CheckCircle, XCircle, FolderUp, Clock, AlertCircle,
  Calendar, ShieldCheck, Hash, ExternalLink, RefreshCw, Sprout
} from 'lucide-react';

/* ── helpers ────────────────────────────────────────────────────────────────── */
const statusMeta = {
  pending:  { label: 'Pending',  Icon: Clock,       bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200' },
  under_verification: { label: 'Verifying', Icon: RefreshCw, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  need_info: { label: 'Action Required', Icon: AlertCircle, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  approved: { label: 'Approved', Icon: CheckCircle, bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200'  },
  rejected: { label: 'Rejected', Icon: XCircle,     bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200'    },
};

const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-40 shrink-0">{label}</span>
    <span className={`text-sm text-gray-800 break-all ${mono ? 'font-mono' : ''}`}>
      {value ?? <span className="text-gray-300 italic">—</span>}
    </span>
  </div>
);

const Section = ({ icon: Icon, title, children, accent = 'green' }) => {
  const colors = {
    green:  'bg-green-50  text-green-600  border-green-100',
    blue:   'bg-blue-50   text-blue-600   border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber:  'bg-amber-50  text-amber-600  border-amber-100',
    teal:   'bg-teal-50   text-teal-600   border-teal-100',
  };
  return (
    <div className={`bg-white rounded-2xl border ${colors[accent].split(' ')[2]} shadow-sm overflow-hidden`}>
      <div className={`px-5 py-4 border-b ${colors[accent].split(' ')[2]} ${colors[accent].split(' ')[0]} flex items-center gap-3`}>
        <Icon className={`w-5 h-5 ${colors[accent].split(' ')[1]}`} />
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
};

/* ── component ──────────────────────────────────────────────────────────────── */
export const ApplicationReview = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToasts();

  const [application, setApplication] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [modalMode, setModalMode]     = useState(null); // 'approve' | 'reject' | 'request-docs' | null

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

  /* ── action handlers ────────────────────────────────────────────────────── */
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
      await fetchApp(); // refresh application data
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Action failed. Please try again.';
      addToast(msg, 'error');
      throw e; // let modal know to not close
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/officer/queue" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </Link>
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { farmer, scheme, status, application_date, decision_date, notes, documents, farm } = application;
  const sm = statusMeta[status] || statusMeta.pending;
  const StatusIcon = sm.Icon;
  const isPending = status === 'pending' || status === 'under_verification';

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />
      <ActionModal mode={modalMode} onClose={() => setModalMode(null)} onSubmit={handleAction} />

      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/officer/dashboard" className="text-gray-400 hover:text-gray-700 transition-colors">Dashboard</Link>
          <span className="text-gray-300">/</span>
          <Link to="/officer/queue" className="text-gray-400 hover:text-gray-700 transition-colors">Queue</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">#{applicationId.slice(0, 8).toUpperCase()}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Application Review
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold
                border ${sm.bg} ${sm.text} ${sm.border}`}>
                <StatusIcon className="w-4 h-4" />
                {sm.label}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-2 ml-11">
              Submitted on {new Date(application_date).toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>

          {/* Action Buttons */}
          {(isPending || status === 'need_info') && (
            <div className="flex gap-2 flex-wrap">
              <button
                id="btn-approve"
                onClick={() => setModalMode('approve')}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold
                  rounded-xl hover:bg-green-700 transition-colors shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                id="btn-request-docs"
                onClick={() => setModalMode('request-docs')}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold
                  rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
              >
                <FolderUp className="w-4 h-4" />
                Need Info
              </button>
              <button
                id="btn-reject"
                onClick={() => setModalMode('reject')}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold
                  rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Status Notice */}
        {status === 'need_info' && (
          <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
            <div>
              <p className="text-sm font-semibold">Waiting on farmer for additional information.</p>
              <p className="text-sm mt-0.5">Note: {notes}</p>
            </div>
          </div>
        )}

        {status === 'approved' || status === 'rejected' ? (
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${sm.bg} ${sm.border}`}>
            <StatusIcon className={`w-5 h-5 shrink-0 mt-0.5 ${sm.text}`} />
            <div>
              <p className={`text-sm font-semibold ${sm.text}`}>
                This application has been {status}.
              </p>
              {decision_date && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Decision on {new Date(decision_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Farmer Info */}
          <Section icon={User} title="Farmer Profile" accent="blue">
            <InfoRow label="Full Name"     value={farmer.user?.full_name} />
            <InfoRow label="Aadhaar No"    value={farmer.aadhar_number} mono />
            <InfoRow label="Father Name"   value={farmer.father_name} />
            <InfoRow label="Category"      value={farmer.category} />
            <InfoRow label="Gender"        value={farmer.gender} />
            <InfoRow label="DOB / Age"     value={`${farmer.date_of_birth} (${farmer.age} years)`} />
            <InfoRow label="Annual Income" value={farmer.annual_income ? `₹${farmer.annual_income.toLocaleString('en-IN')}` : null} />
            <InfoRow label="Phone Number"  value={farmer.phone_number} mono />
            <InfoRow
              label="Verification"
              value={
                farmer.is_verified
                  ? <span className="flex items-center gap-1 text-green-600"><ShieldCheck className="w-4 h-4" /> Verified</span>
                  : <span className="text-red-500">Not Verified</span>
              }
            />
          </Section>

          {/* Farm Info */}
          <Section icon={Sprout} title="Farm & Cultivation Details" accent="teal">
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
              <p className="text-sm text-gray-400 italic py-3">No farm details provided.</p>
            )}
          </Section>

          {/* Scheme Info */}
          <Section icon={Landmark} title="Scheme Details" accent="purple">
            <InfoRow label="Scheme Name"   value={scheme.scheme_name} />
            <InfoRow label="Subsidy Amount"
              value={
                <span className="text-lg font-bold text-green-700">
                  ₹{scheme.subsidy_amount.toLocaleString('en-IN')}
                </span>
              }
            />
            <InfoRow label="Scheme ID"     value={scheme.id} mono />
            <InfoRow label="Sector"        value={scheme.sector} />
            <InfoRow label="Department"    value={scheme.department} />
            <InfoRow label="Description"   value={scheme.description} />
          </Section>

          {/* Application Timeline */}
          <Section icon={Calendar} title="Application Information" accent="green">
            <InfoRow label="Application ID" value={application.id} mono />
            <InfoRow label="Application Date"
              value={new Date(application_date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            />
            <InfoRow
              label="Decision Date"
              value={decision_date
                ? new Date(decision_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })
                : null}
            />
            <InfoRow label="Assigned Officer" value={application.assigned_officer || 'Unassigned'} mono />
          </Section>

        </div>

        {/* Notes */}
        <Section icon={FileText} title="Officer Notes / Remarks" accent="amber">
          {notes ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{notes}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic py-2">No remarks recorded yet.</p>
          )}
        </Section>

      </div>
    </>
  );
};
