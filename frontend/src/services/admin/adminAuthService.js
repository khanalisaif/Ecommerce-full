import api from '../api'

// Matches backend: /api/admin/auth/*
export const adminAuthService = {
  register: (payload) => api.post('/admin/auth/register', payload), // { name, email, password, role }
  login: (payload) => api.post('/admin/auth/login', payload), // { email, password }
  requestOtpLogin: (payload) => api.post('/admin/auth/request-otp-login', payload), // { email }
  verifyOtpLogin: (payload) => api.post('/admin/auth/verify-otp-login', payload), // { email, otp }
  logout: () => api.post('/admin/auth/logout'),
  getMe: () => api.get('/admin/auth/me'),
}

export default adminAuthService
