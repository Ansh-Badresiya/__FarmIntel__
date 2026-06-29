import api from './api';

export const farmerService = {
  // Profile - backend uses POST for both create and update
  getProfile: () => api.get('/farmer/profile'),
  updateProfile: (data) => api.post('/farmer/profile', data),
  
  // Farm Details - backend uses POST for both create and update
  getFarm: () => api.get('/farmer/farm'),
  createFarm: (data) => api.post('/farmer/farm', data),
  updateFarm: (data) => api.post('/farmer/farm', data),
  
  // Crop History
  getCropHistory: () => api.get('/farmer/crop-history'),
  addCropHistory: (data) => api.post('/farmer/crop-history', data),

  // Subsidies & Applications
  getSubsidies: () => api.get('/farmer/subsidies'),
  getApplications: () => api.get('/farmer/applications'),
  applySubsidy: (scheme_id) => api.post('/farmer/apply', { scheme_id }),
};
