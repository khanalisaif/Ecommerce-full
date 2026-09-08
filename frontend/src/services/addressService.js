import api from './api'

// Matches backend: /api/user/addresses/*
export const addressService = {
  getAddresses: () => api.get('/user/addresses'),
  addAddress: (payload) => api.post('/user/addresses', payload),
  updateAddress: (addressId, payload) => api.put(`/user/addresses/${addressId}`, payload),
  deleteAddress: (addressId) => api.delete(`/user/addresses/${addressId}`),
  setDefaultAddress: (addressId) => api.put(`/user/addresses/${addressId}/set-default`),
}

export default addressService
