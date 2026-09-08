import api from '../api'

// Matches backend: /api/admin/customers/*
export const adminCustomerService = {
  getAllCustomers: (params = {}) => api.get('/admin/customers', { params }), // { search, page, limit }
  getCustomerById: (id) => api.get(`/admin/customers/${id}`),
  toggleCustomerActive: (id) => api.put(`/admin/customers/${id}/toggle-active`),
  deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),
}

export default adminCustomerService
