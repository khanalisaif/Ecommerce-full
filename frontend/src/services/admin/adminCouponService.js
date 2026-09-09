import api from '../api'

export const adminCouponService = {
  createCoupon: (payload) => api.post('/admin/coupons', payload),
  getAllCoupons: () => api.get('/admin/coupons'),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  toggleCoupon: (id) => api.patch(`/admin/coupons/${id}/toggle`),
}

export default adminCouponService
