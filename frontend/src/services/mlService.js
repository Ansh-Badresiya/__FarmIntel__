import api from './api';

export const mlService = {
  /**
   * Unified recommendation — single call that runs Stage 1 + 2 + 3 on the backend.
   * @param {{ state?: string, district?: string, season: string, year: number }} data
   */
  getRecommendation: (data) => api.post('/farmer/recommend', data),

  // ── Legacy helpers (kept for any other callers) ──────────────────────────
  predictCrop:       (data)   => api.post('/farmer/crop-recommend', data),
  predictYield:      (data)   => api.post('/farmer/yield-predict', data),
  getSoilDataPreview:(params) => {
    const queryStr = new URLSearchParams(params).toString();
    return api.get(`/farmer/soil-data-preview?${queryStr}`);
  },
  getCropInputData: () => api.get('/farmer/crop-input-data'),
};
