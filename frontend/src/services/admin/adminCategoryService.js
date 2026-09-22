import api from '../api'

// Matches backend: /api/admin/categories/*
// image is a plain string (base64 data URI or existing hosted URL) in JSON.
export const adminCategoryService = {
  getAllCategories: () => api.get('/admin/categories'),
  createCategory: (payload) => api.post('/admin/categories', payload), // { name, icon, image, subcategories }
  reorderCategories: (orderedIds) => api.put('/admin/categories/reorder', { orderedIds }),
  updateCategory: (id, payload) => api.put(`/admin/categories/${id}`, payload),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  addSubcategory: (id, payload) => api.post(`/admin/categories/${id}/subcategories`, payload), // { name, slug }
  updateSubcategory: (id, subId, payload) => api.put(`/admin/categories/${id}/subcategories/${subId}`, payload),
  deleteSubcategory: (id, subId) => api.delete(`/admin/categories/${id}/subcategories/${subId}`),
}

export default adminCategoryService
