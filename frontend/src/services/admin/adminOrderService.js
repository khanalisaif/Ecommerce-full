import api from '../api'

// Matches backend: /api/admin/orders/*
export const adminOrderService = {
  // ── Standard CRUD ──────────────────────────────────────────────────────────
  getAllOrders:      (params = {}) => api.get('/admin/orders', { params }),
  getOrderById:     (id)          => api.get(`/admin/orders/${id}`),
  updateOrderStatus:  (id, status)        => api.put(`/admin/orders/${id}/status`,          { status }),
  updatePaymentStatus:(id, paymentStatus) => api.put(`/admin/orders/${id}/payment-status`,  { paymentStatus }),
  deleteOrder:      (id)          => api.delete(`/admin/orders/${id}`),

  // ── Delhivery ──────────────────────────────────────────────────────────────
  /** Create Delhivery shipment & get AWB — moves order → Processing */
  confirmWithDelhivery: (id)      => api.post(`/admin/orders/${id}/delhivery/confirm`),

  /** Re-create shipment on Delhivery (after cancellation) */
  resendToDelhivery:    (id)      => api.post(`/admin/orders/${id}/delhivery/resend`),

  /** Fetch shipping label PDF URL from Delhivery */
  getDelhiveryLabel:    (id)      => api.get(`/admin/orders/${id}/delhivery/label`),

  /** Cancel shipment on Delhivery + mark order Cancelled */
  cancelOnDelhivery:    (id)      => api.post(`/admin/orders/${id}/delhivery/cancel`),

  /** Live tracking scans from Delhivery */
  trackOnDelhivery:     (id)      => api.get(`/admin/orders/${id}/delhivery/track`),

  /**
   * Schedule bulk pickup with Delhivery
   * @param {object} payload — { pickupDate, pickupTime, packageCount, orderIds? }
   */
  schedulePickup: (payload)       => api.post('/admin/orders/delhivery/schedule-pickup', payload),
}

export default adminOrderService
