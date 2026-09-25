import api from './api'

// Matches backend: /api/user/delivery/*
const deliveryService = {
  /**
   * Get TAT (delivery estimate) + shipping charges for a destination pincode.
   * @param {string|number} pincode  - 6-digit destination pincode
   * @param {object} opts            - { weight (grams), mode ('S'|'E'), payment_type ('Prepaid'|'COD') }
   */
  getDeliveryInfo: (pincode, opts = {}) =>
    api.get('/user/delivery/tat', {
      params: {
        pincode,
        weight:       opts.weight       || 50,
        mode:         opts.mode         || 'S',
        payment_type: opts.payment_type || 'Prepaid',
      },
    }),

  /**
   * Check if a pincode is serviceable by Delhivery.
   * @param {string|number} pincode - 6-digit pincode
   */
  checkServiceability: (pincode) =>
    api.get('/user/delivery/serviceability', { params: { pincode } }),
}

export default deliveryService
