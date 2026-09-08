import api from './api'

// Matches backend: POST /api/chat
export const chatService = {
  sendMessage: (message, history = []) => api.post('/chat', { message, history }),
}

export default chatService
