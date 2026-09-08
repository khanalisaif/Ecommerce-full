import api from './api'

// Matches backend: /api/user/products/:productId/reviews, /api/user/reviews/*
export const reviewService = {
  getProductReviews: (productId) => api.get(`/user/products/${productId}/reviews`),
  createReview: (productId, payload) => api.post(`/user/products/${productId}/reviews`, payload), // { rating, title, body }

  getMyReviews: () => api.get('/user/reviews'),
  updateReview: (id, payload) => api.put(`/user/reviews/${id}`, payload),
  deleteReview: (id) => api.delete(`/user/reviews/${id}`),
  markHelpful: (id) => api.post(`/user/reviews/${id}/helpful`),
}

export default reviewService
