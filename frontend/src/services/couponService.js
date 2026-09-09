import api from './api'

export const couponService = {
  applyCoupon: (code, cartTotal) => api.post('/user/coupons/apply', { code, cartTotal }),
  getAvailableCoupons: () => api.get('/user/coupons/available'),
}

export default couponService
