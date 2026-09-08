import axios from 'axios'

// Central axios instance. All requests go through here so cookies (user_token /
// admin_token) are always sent, and API errors come back in one consistent shape.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // send/receive httpOnly cookies set by the backend
  headers: { 'Content-Type': 'application/json' },
})

// Automatically attach JWT Bearer tokens from localStorage for both user and admin calls
api.interceptors.request.use((config) => {
  const isAdminRoute = config.url?.startsWith('/admin') || config.url?.includes('/admin')
  const token = isAdminRoute
    ? localStorage.getItem('admin_token')
    : localStorage.getItem('user_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize backend error shape ({ success, message, errors }) into a plain Error
// so every service call can just `catch (err) { err.message }`.
api.interceptors.response.use(
  (response) => response.data, // unwrap { success, data, message } automatically
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.'
    const errors = error.response?.data?.errors || []
    const normalized = new Error(message)
    normalized.errors = errors
    normalized.statusCode = error.response?.status
    return Promise.reject(normalized)
  }
)

export default api
