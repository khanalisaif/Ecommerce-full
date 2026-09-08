import api from './api'

// Matches backend: /api/user/wishlist/*
export const wishlistService = {
  getWishlist: () => api.get('/user/wishlist'),
  addToWishlist: (productId) => api.post(`/user/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/user/wishlist/${productId}`),
}

export default wishlistService
