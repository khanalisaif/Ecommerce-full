import api from './api'

// Matches backend: GET /api/content, GET /api/content/:key
export const contentKVService = {
  getAll: () => api.get('/content'), // { content: { key: value, ... } }
  getByKey: (key) => api.get(`/content/${key}`), // { key, value }
}

export default contentKVService
