import api from './api'

export const coinsService = {
  getCoins: () => api.get('/user/coins'),
}

export default coinsService
