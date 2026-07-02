import api from './api';

export const officerService = {
  // List all pending applications (officer sees own queue, admin sees all)
  getApplications: (params = {}) => api.get('/officer/applications', { params }),

  // Get full detail of a single application
  getApplicationDetail: (id) => api.get(`/officer/application/${id}`),

  // Approve a pending application (notes optional)
  approveApplication: (id, notes = '') =>
    api.post(`/officer/approve/${id}`, { notes }),

  // Reject a pending application (reason mandatory)
  rejectApplication: (id, reason) =>
    api.post(`/officer/reject/${id}`, { reason }),

  // Request additional documents from farmer
  requestDocuments: (id, document_request) =>
    api.post(`/officer/request-document/${id}`, { document_request }),

  // Admin-only: assign officer to application
  assignOfficer: (applicationId, officer_id) =>
    api.post(`/officer/assign/${applicationId}`, { officer_id }),
};
