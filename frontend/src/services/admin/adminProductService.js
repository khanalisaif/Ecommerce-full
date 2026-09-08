import api from '../api'

// Matches backend: /api/admin/products/*
// Images are sent as plain strings in JSON — either base64 data URIs (new
// picks, already compressed client-side via utils/imageCompression) or
// existing hosted URLs (unchanged on edit). No multipart/FormData needed.
export const adminProductService = {
  getAllProducts: (params = {}) => api.get('/admin/products', { params }), // { page, limit, search }
  getProductById: (id) => api.get(`/admin/products/${id}`),
  createProduct: (payload) => api.post('/admin/products', payload),
  updateProduct: (id, payload) => api.put(`/admin/products/${id}`, payload),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  updateStock: (id, stock) => api.put(`/admin/products/${id}/stock`, { stock }),
}

export default adminProductService
