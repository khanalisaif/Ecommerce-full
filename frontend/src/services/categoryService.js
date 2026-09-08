import api from './api'

// Matches backend: /api/user/categories
export const categoryService = {
  getCategories: () => api.get('/user/categories'),
}

export default categoryService
