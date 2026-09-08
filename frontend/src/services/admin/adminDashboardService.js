import api from '../api'

// Matches backend: /api/admin/dashboard/*
export const adminDashboardService = {
  getOverview: () => api.get('/admin/dashboard/overview'),
  getInventoryOverview: () => api.get('/admin/dashboard/inventory'),
}

export default adminDashboardService
