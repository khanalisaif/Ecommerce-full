import api from './api'

// Matches backend: /api/user/products/*, /api/user/search
export const productService = {
  // filters: { category, brand, color, size, minPrice, maxPrice, minRating, sort, page, limit }
  getProducts: (filters = {}) => api.get('/user/products', { params: filters }),
  getBestSellers: () => api.get('/user/products/best-sellers'),
  getNewArrivals: () => api.get('/user/products/new-arrivals'),
  getProductById: (id) => api.get(`/user/products/${id}`),
  search: (q) => api.get('/user/search', { params: { q } }),
}

export default productService
