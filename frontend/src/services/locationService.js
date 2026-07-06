import api from './api';

export const locationService = {
  getStates: () => api.get('/locations/states'),
  getDistricts: (state) => api.get(`/locations/districts?state=${encodeURIComponent(state)}`),
  getVillages: (district) => api.get(`/locations/villages?district=${encodeURIComponent(district)}`)
};
