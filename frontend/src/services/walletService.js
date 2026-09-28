import api from './api'

export const walletService = {
  getWallet: () => api.get('/user/wallet'),
}

export default walletService
