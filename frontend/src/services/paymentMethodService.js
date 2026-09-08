import api from './api'

// Matches backend: /api/user/payment-methods/*
export const paymentMethodService = {
  getPaymentMethods: () => api.get('/user/payment-methods'),
  addCard: (number, cardHolderName, expiry) => api.post('/user/payment-methods', { type: 'card', number, cardHolderName, expiry }),
  addUpi: (upiId) => api.post('/user/payment-methods', { type: 'upi', upiId }),
  deletePaymentMethod: (id) => api.delete(`/user/payment-methods/${id}`),
}

export default paymentMethodService
