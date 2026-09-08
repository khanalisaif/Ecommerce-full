import api from '../api'

// Matches backend: /api/admin/orders/*
export const adminOrderService = {
  getAllOrders: (params = {}) => api.get('/admin/orders', { params }), // { status, page, limit }
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  updatePaymentStatus: (id, paymentStatus) => api.put(`/admin/orders/${id}/payment-status`, { paymentStatus }),
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
}

export default adminOrderService
