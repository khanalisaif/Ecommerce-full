import api from './api'

// Matches backend: /api/user/orders/*
export const orderService = {
  placeOrder:  (payload)  => api.post('/user/orders', payload),
  getMyOrders: ()         => api.get('/user/orders'),
  getOrderById:(orderId)  => api.get(`/user/orders/${orderId}`),
  cancelOrder: (orderId)  => api.put(`/user/orders/${orderId}/cancel`),
  /** Live Delhivery tracking for the user's own order */
  trackOrder:  (orderId)  => api.get(`/user/orders/${orderId}/track`),
}

export default orderService
