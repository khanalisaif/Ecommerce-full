import api from '../api'

// Analytics API service
const adminAnalyticsService = {
  // Record a product view (called from ProductDetailPage)
  recordProductView: (productId, sessionId = '') =>
    api.post('/analytics/product-view', { productId, sessionId }),

  // Admin: get all products with view counts
  getProductsAnalytics: () => api.get('/analytics/products'),

  // Admin: get users who viewed a specific product
  getProductViewers: (productId) =>
    api.get(`/analytics/products/${productId}/viewers`),
}

export default adminAnalyticsService
