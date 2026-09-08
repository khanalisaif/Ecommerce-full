import api from './api'

// Matches backend: /api/user/auth/*
export const authService = {
  signup: (payload) => api.post('/user/auth/signup', payload), // { fullName, email, mobileNumber, password }
  verifySignupOtp: (payload) => api.post('/user/auth/verify-signup-otp', payload), // { userId, otp }
  resendSignupOtp: (payload) => api.post('/user/auth/resend-signup-otp', payload), // { userId }

  login: (payload) => api.post('/user/auth/login', payload), // { emailOrMobile, password }

  requestOtpLogin: (payload) => api.post('/user/auth/request-otp-login', payload), // { emailOrMobile }
  verifyOtpLogin: (payload) => api.post('/user/auth/verify-otp-login', payload), // { userId, otp }

  // Email-link based forgot/reset password flow
  forgotPassword: (payload) => api.post('/user/auth/forgot-password', payload), // { email }
  checkResetToken: (token) => api.get(`/user/auth/reset-password/${token}/valid`),
  resetPassword: (token, newPassword) => api.post(`/user/auth/reset-password/${token}`, { newPassword }),

  // Social login — pass { credential } (ID token) or { accessToken } (OAuth2 token client)
  googleLogin: (payload) => api.post('/user/auth/google', payload),
  facebookLogin: (accessToken) => api.post('/user/auth/facebook', { accessToken }),

  logout: () => api.post('/user/auth/logout'),
  getMe: () => api.get('/user/auth/me'),
}

export default authService
