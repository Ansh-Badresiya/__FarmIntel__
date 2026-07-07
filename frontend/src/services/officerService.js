import api from './api';

export const officerService = {
  // List applications — accepts URLSearchParams or plain object for filtering
  getApplications: (params = '') => {
    const queryString = typeof params === 'string' ? params : new URLSearchParams(params).toString();
    const url = queryString ? `/officer/applications?${queryString}` : '/officer/applications';
    return api.get(url);
  },

  // Get full detail of a single application
  getApplicationDetail: (id) => api.get(`/officer/application/${id}`),

  // Approve a pending application (notes optional)
  approveApplication: (id, notes = '') =>
    api.post(`/officer/approve/${id}`, { notes }),

  // Reject a pending application (reason mandatory)
  rejectApplication: (id, reason) =>
    api.post(`/officer/reject/${id}`, { reason }),

  // Request additional info / documents from farmer (backend: /officer/need-info/{id})
  requestDocuments: (id, document_request) =>
    api.post(`/officer/need-info/${id}`, { message: document_request }),

  // Admin-only: assign officer to application
  assignOfficer: (applicationId, officer_id) =>
    api.post(`/officer/assign/${applicationId}`, { officer_id }),
};

