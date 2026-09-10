import api from './api'

export const subscribeNewsletter = (email, source = 'signup_page') =>
  api.post('/user/subscribe', { email, source })

export const unsubscribeNewsletter = (token) =>
  api.get(`/user/subscribe/unsubscribe/${token}`)

export default { subscribeNewsletter, unsubscribeNewsletter }
