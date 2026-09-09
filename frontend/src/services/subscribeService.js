import api from './api'

export const subscribeNewsletter = (email, source = 'signup_page') =>
  api.post('/user/subscribe', { email, source })

export default { subscribeNewsletter }
