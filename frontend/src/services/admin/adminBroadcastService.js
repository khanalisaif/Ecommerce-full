import api from '../api'

export const adminBroadcastService = {
  sendNews: (payload) => api.post('/admin/broadcast/news', payload),
  getAll: () => api.get('/admin/broadcast'),
  delete: (id) => api.delete(`/admin/broadcast/${id}`),
}

export default adminBroadcastService
