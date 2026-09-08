import api from './api'

// Matches backend: /api/user/preferences
export const preferencesService = {
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (payload) => api.put('/user/preferences', payload), // { privacy?: {...}, notifications?: {...} }
}

export default preferencesService
