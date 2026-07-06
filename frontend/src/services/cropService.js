import api from './api';

export const cropService = {
  getCrops: () => api.get('/crops'),
  getCropsBySeason: (season) => api.get(`/crops?season=${encodeURIComponent(season)}`),
  getIrrigationTypes: () => api.get('/irrigation-types')
};
