import api from './api'

// Matches backend: /api/user/orders/*
export const orderService = {
  placeOrder: (payload) => api.post('/user/orders', payload), // { addressId, paymentMethod, deliveryOption, orderNotes }
  getMyOrders: () => api.get('/user/orders'),
  getOrderById: (orderId) => api.get(`/user/orders/${orderId}`),
  cancelOrder: (orderId) => api.put(`/user/orders/${orderId}/cancel`),
}

export default orderService
