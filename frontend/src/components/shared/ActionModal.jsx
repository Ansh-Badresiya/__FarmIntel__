import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, XCircle, FolderUp } from 'lucide-react';
import { useForm } from 'react-hook-form';

/**
 * ActionModal – inline modal for approve / reject / request-docs.
 *
 * Props:
 *   mode     ('approve' | 'reject' | 'request-docs' | null)
 *   onClose  fn
 *   onSubmit fn({ notes, reason, document_request }) => Promise
 */
export const ActionModal = ({ mode, onClose, onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const backdropRef = useRef(null);

  useEffect(() => {
    reset();
  }, [mode, reset]);

  if (!mode) return null;

  const config = {
    approve: {
      title: 'Approve Application',
      icon: <CheckCircle size={20} color="#1A7A1A" />,
      headerBg: '#1A7A1A',
      buttonStyle: { background: '#1A7A1A' },
      buttonHover: '#15601A',
      buttonLabel: 'Approve Application',
      fields: [
        {
          name: 'notes',
          label: 'Approval Notes (Optional)',
          placeholder: 'Add any remarks or instructions for the farmer...',
          required: false,
          multiline: true,
        },
      ],
    },
    reject: {
      title: 'Reject Application',
      icon: <XCircle size={20} color="#C0392B" />,
      headerBg: '#C0392B',
      buttonStyle: { background: '#C0392B' },
      buttonHover: '#A93226',
      buttonLabel: 'Reject Application',
      fields: [
        {
          name: 'reason',
          label: 'Rejection Reason *',
          placeholder: 'State the specific reason for rejection...',
          required: true,
          multiline: true,
        },
      ],
    },
    'request-docs': {
      title: 'Request Additional Documents',
      icon: <FolderUp size={20} color="#B8860B" />,
      headerBg: '#B8860B',
      buttonStyle: { background: '#B8860B' },
      buttonHover: '#9A7209',
      buttonLabel: 'Send Document Request',
      fields: [
        {
          name: 'document_request',
          label: 'Required Documents *',
          placeholder: 'Describe the specific documents needed from the farmer...',
          required: true,
          multiline: true,
        },
      ],
    },
  };

  const { title, icon, headerBg, buttonStyle, buttonLabel, fields } = config[mode];

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const doSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
      }}
    >
      <div style={{
        position: 'relative',
        background: '#fff',
        borderRadius: '6px',
        width: '100%',
        maxWidth: '460px',
        margin: '0 16px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        border: '1px solid var(--gov-border)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 20px',
          background: headerBg,
          borderBottom: '2px solid rgba(255,255,255,0.2)',
        }}>
          {React.cloneElement(icon, { color: '#fff' })}
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', flex: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(doSubmit)} style={{ padding: '20px' }}>
          {fields.map((f) => (
            <div key={f.name} style={{ marginBottom: '16px' }}>
              <label className="gov-label">
                {f.label}
              </label>
              {f.multiline ? (
                <textarea
                  id={`modal-${f.name}`}
                  rows={4}
                  placeholder={f.placeholder}
                  {...register(f.name, {
                    required: f.required ? `${f.label.replace(' *', '')} is required` : false,
                  })}
                  className="gov-input"
                  style={{ resize: 'vertical', minHeight: '90px' }}
                />
              ) : (
                <input
                  id={`modal-${f.name}`}
                  type="text"
                  placeholder={f.placeholder}
                  {...register(f.name, {
                    required: f.required ? `${f.label} is required` : false,
                  })}
                  className="gov-input"
                />
              )}
              {errors[f.name] && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#C0392B' }}>{errors[f.name].message}</p>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--gov-border)', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="gov-btn gov-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="gov-btn"
              style={{ ...buttonStyle, color: '#fff' }}
            >
              {isSubmitting ? 'Processing...' : buttonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
