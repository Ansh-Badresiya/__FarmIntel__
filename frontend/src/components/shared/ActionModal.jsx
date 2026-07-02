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
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      accent: 'green',
      buttonLabel: 'Approve',
      buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      fields: [
        {
          name: 'notes',
          label: 'Approval Notes (optional)',
          placeholder: 'Add any remarks for the farmer…',
          required: false,
          multiline: true,
        },
      ],
    },
    reject: {
      title: 'Reject Application',
      icon: <XCircle className="w-6 h-6 text-red-600" />,
      accent: 'red',
      buttonLabel: 'Reject',
      buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      fields: [
        {
          name: 'reason',
          label: 'Rejection Reason *',
          placeholder: 'State the reason for rejection…',
          required: true,
          multiline: true,
        },
      ],
    },
    'request-docs': {
      title: 'Request Additional Documents',
      icon: <FolderUp className="w-6 h-6 text-amber-600" />,
      accent: 'amber',
      buttonLabel: 'Send Request',
      buttonClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      fields: [
        {
          name: 'document_request',
          label: 'Document Description *',
          placeholder: 'Describe which documents are needed…',
          required: true,
          multiline: true,
        },
      ],
    },
  };

  const { title, icon, buttonLabel, buttonClass, fields } = config[mode];

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          {icon}
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(doSubmit)} className="p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                    focus:ring-2 focus:ring-offset-0 focus:ring-green-500 focus:border-transparent
                    resize-none outline-none transition"
                />
              ) : (
                <input
                  id={`modal-${f.name}`}
                  type="text"
                  placeholder={f.placeholder}
                  {...register(f.name, {
                    required: f.required ? `${f.label} is required` : false,
                  })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                    focus:ring-2 focus:ring-offset-0 focus:ring-green-500 focus:border-transparent
                    outline-none transition"
                />
              )}
              {errors[f.name] && (
                <p className="mt-1 text-xs text-red-600">{errors[f.name].message}</p>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
                rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-sm font-medium text-white rounded-lg
                focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed ${buttonClass}`}
            >
              {isSubmitting ? 'Processing…' : buttonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
