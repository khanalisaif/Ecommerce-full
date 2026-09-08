import api from '../api'

// Matches backend: /api/admin/categories/*
// image is a plain string (base64 data URI or existing hosted URL) in JSON.
export const adminCategoryService = {
  getAllCategories: () => api.get('/admin/categories'),
  createCategory: (payload) => api.post('/admin/categories', payload), // { name, icon, image }
  updateCategory: (id, payload) => api.put(`/admin/categories/${id}`, payload),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
}

export default adminCategoryService
