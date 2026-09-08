import api from '../api'

// Matches backend: PUT /api/admin/content/:key
export const adminContentService = {
  setByKey: (key, value) => api.put(`/admin/content/${key}`, { value }),
}

export default adminContentService
