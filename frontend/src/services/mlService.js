import api from './api';

export const mlService = {
  predictCrop: async (data) => {
    // In the future this will hit a real backend endpoint:
    // return api.post('/ml/crop-recommend', data);
    
    // For now, simulating an API call and returning mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { recommendation: 'Wheat', confidence: 0.92 } });
      }, 1500);
    });
  },

  predictYield: async (data) => {
    // In the future this will hit a real backend endpoint:
    // return api.post('/ml/yield-predict', data);
    
    // For now, simulating an API call and returning mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { predicted_yield: 4.5, unit: 'tonnes/hectare' } });
      }, 1500);
    });
  }
};
