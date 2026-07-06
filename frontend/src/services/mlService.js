import api from './api';

export const mlService = {
  // Crop Recommendation
  predictCrop: (data) => api.post('/farmer/crop-recommend', data),
  
  // Yield Prediction
  predictYield: (data) => api.post('/farmer/yield-predict', data),
  
  // Get Soil Data Preview
  getSoilDataPreview: (params) => {
    // Convert object to query string
    const queryStr = new URLSearchParams(params).toString();
    return api.get(`/farmer/soil-data-preview?${queryStr}`);
  },
  
  // Get Crop Input Data (profile + options)
  getCropInputData: () => api.get('/farmer/crop-input-data')
};
