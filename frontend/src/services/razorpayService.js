import api from './api'

// Dynamically inject the Razorpay checkout script (idempotent)
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true) // already loaded
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const razorpayService = {
  // POST /api/razorpay/create-order  — { amount (₹), currency?, mode? }
  createOrder: (payload) => api.post('/razorpay/create-order', payload),

  // POST /api/razorpay/verify-payment — { razorpay_order_id, razorpay_payment_id, razorpay_signature, mode? }
  verifyPayment: (payload) => api.post('/razorpay/verify-payment', payload),
}

export default razorpayService
