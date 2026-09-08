import api from './api'

// Matches backend: /api/user/cart/*
export const cartService = {
  getCart: () => api.get('/user/cart'),
  addToCart: (payload) => api.post('/user/cart', payload), // { productId, quantity, size, color }
  updateCartItem: (itemId, quantity) => api.put(`/user/cart/${itemId}`, { quantity }),
  removeCartItem: (itemId) => api.delete(`/user/cart/${itemId}`),
  clearCart: () => api.delete('/user/cart'),
}

export default cartService
