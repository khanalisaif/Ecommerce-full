import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Smartphone, CreditCard, Landmark, Wallet, Banknote, Lock, Package, RefreshCw, CheckCircle2, Loader2,
} from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import addressService from '../services/addressService'
import orderService from '../services/orderService'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems, cartSubtotal, cartDiscount, clearCart, showToast } = useShop()
  const { isAuthenticated, isAuthLoading } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [deliveryOption, setDeliveryOption] = useState('standard')
  const [orderNotes, setOrderNotes] = useState('')
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlacing, setIsPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  useEffect(() => {
    if (isAuthLoading) return
    if (!isAuthenticated) {
      showToast('Please login to checkout')
      navigate('/login')
      return
    }
    addressService.getAddresses()
      .then((res) => {
        const list = res.data.addresses || []
        setAddresses(list)
        const def = list.find((a) => a.isDefault) || list[0]
        setSelectedAddressId(def?._id || null)
      })
      .catch((err) => showToast(err.message))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading])

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId)

  const FREE_SHIPPING_THRESHOLD = 999
  const subtotal = cartSubtotal
  const discount = cartDiscount
  const standardShippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 200
  const shippingCost = deliveryOption === 'express' ? standardShippingCost + 79 : standardShippingCost
  const total = subtotal - discount + shippingCost
  const savePercent = subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return
    if (!selectedAddressId) {
      showToast('Please add a delivery address first')
      navigate('/address')
      return
    }
    setIsPlacing(true)
    orderService.placeOrder({ addressId: selectedAddressId, paymentMethod, deliveryOption, orderNotes })
      .then((res) => {
        setPlacedOrder(res.data.order)
        clearCart()
      })
      .catch((err) => showToast(err.message))
      .finally(() => setIsPlacing(false))
  }

  const paymentOptions = [
    { id: 'upi', icon: Smartphone, title: 'UPI', subtitle: 'Pay using any UPI App',
      right: <span className="border border-purple-300 text-purple-600 text-xs font-bold px-2 py-1 rounded">UPI</span> },
    { id: 'card', icon: CreditCard, title: 'Credit / Debit Card', subtitle: 'Visa, Mastercard, Rupay & more',
      right: (
        <span className="flex items-center gap-2 text-xs font-bold">
          <span className="text-blue-600">RuPay</span>
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-red-500 inline-block"></span>
            <span className="w-4 h-4 rounded-full bg-yellow-400 inline-block opacity-90"></span>
          </span>
          <span className="text-blue-800">VISA</span>
        </span>
      ) },
    { id: 'netbanking', icon: Landmark, title: 'Net Banking', subtitle: 'All major banks supported',
      right: <Landmark size={18} className="text-gray-400" /> },
    { id: 'wallet', icon: Wallet, title: 'Wallets', subtitle: 'Paytm, PhonePe, Amazon Pay & more',
      right: (
        <span className="flex items-center gap-2 text-xs font-bold">
          <span className="text-blue-600">RuPay</span>
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-red-500 inline-block"></span>
            <span className="w-4 h-4 rounded-full bg-yellow-400 inline-block opacity-90"></span>
          </span>
          <span className="text-blue-800">VISA</span>
        </span>
      ) },
    { id: 'cod', icon: Banknote, title: 'Cash on Delivery (COD)', subtitle: 'Pay when your order is delivered',
      right: <Banknote size={18} className="text-green-500" /> },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    )
  }

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-2">Thank you for your order. Order ID: <span className="font-bold">{placedOrder.orderId}</span></p>
          <p className="text-gray-500 mb-8 text-sm">You'll receive a confirmation email shortly.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Step 1: Delivery Address */}
            <div className="bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-7 h-7 bg-purple-50 text-purple-700 rounded-full font-bold text-xs flex-shrink-0">1</div>
                <h2 className="font-bold text-gray-900 text-[15px]">Delivery Address</h2>
              </div>
              <div className="space-y-4">
                {addresses.length === 0 && (
                  <p className="text-gray-500 text-sm">No saved addresses yet.</p>
                )}
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`block border rounded-xl p-5 cursor-pointer transition-all ${
                      selectedAddressId === addr._id ? 'border-purple-400 bg-purple-50/30' : 'border-gray-100 bg-gray-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="w-4 h-4 accent-purple-600"
                        />
                        <h3 className="font-bold text-gray-900 text-[15px]">{addr.fullName}</h3>
                        <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {addr.isDefault ? 'PRIMARY' : addr.addressType}
                        </span>
                      </div>
                      <button onClick={() => navigate('/address')} className="text-purple-600 font-semibold text-xs hover:underline">Change</button>
                    </div>
                    <div className="text-[13px] text-gray-500 leading-[1.6] pl-7">
                      <p className="mb-2 text-gray-900 font-medium">{addr.mobile}</p>
                      <p>{addr.addressLine}{addr.landmark ? `, ${addr.landmark}` : ''}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </label>
                ))}

                <button
                  onClick={() => navigate('/address')}
                  className="w-full border border-dashed border-purple-200 text-purple-600 font-bold text-sm py-3.5 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-lg leading-none">+</span> Add New Address
                </button>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-7 h-7 bg-purple-50 text-purple-700 rounded-full font-bold text-xs flex-shrink-0">2</div>
                <h2 className="font-bold text-gray-900 text-[15px]">Payment Method</h2>
              </div>
              <div className="space-y-3">
                {paymentOptions.map((opt) => {
                  const Icon = opt.icon
                  const selected = paymentMethod === opt.id
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        selected ? 'border-purple-400 bg-purple-50/50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.id}
                        checked={selected}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-[18px] h-[18px] accent-blue-600 flex-shrink-0"
                      />
                      <div className="w-10 h-10 rounded-lg bg-gray-50/80 flex items-center justify-center ml-4 flex-shrink-0 border border-gray-100">
                        <Icon size={18} className="text-gray-500" />
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{opt.title}</p>
                        <p className={`text-[12px] mt-0.5 ${selected ? 'text-purple-600' : 'text-gray-500'}`}>{opt.subtitle}</p>
                      </div>
                      <div className="ml-auto flex-shrink-0">{opt.right}</div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Step 3: Delivery Options */}
            <div className="bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-7 h-7 bg-purple-50 text-purple-700 rounded-full font-bold text-xs flex-shrink-0">3</div>
                <h2 className="font-bold text-gray-900 text-[15px]">Delivery Options</h2>
              </div>
              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    deliveryOption === 'standard' ? 'border-purple-400 bg-purple-50/50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="standard"
                    checked={deliveryOption === 'standard'}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="w-[18px] h-[18px] accent-blue-600 flex-shrink-0"
                  />
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">Standard Delivery (3-5 Days)</p>
                    <p className={`text-[12px] mt-0.5 ${deliveryOption === 'standard' ? 'text-purple-600' : 'text-gray-500'}`}>Free on orders above ₹999</p>
                  </div>
                  <span className={`ml-auto font-bold text-sm ${standardShippingCost === 0 ? 'text-green-500' : 'text-gray-900'}`}>
                    {standardShippingCost === 0 ? 'FREE' : `₹${standardShippingCost}`}
                  </span>
                </label>

                <label
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    deliveryOption === 'express' ? 'border-purple-400 bg-purple-50/50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="express"
                    checked={deliveryOption === 'express'}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="w-[18px] h-[18px] accent-blue-600 flex-shrink-0"
                  />
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">Express Delivery (1-2 Days)</p>
                    <p className={`text-[12px] mt-0.5 ${deliveryOption === 'express' ? 'text-purple-600' : 'text-gray-500'}`}>Get your order faster</p>
                  </div>
                  <span className="ml-auto font-bold text-gray-900 text-sm">
                    {standardShippingCost === 0 ? '₹79' : `₹${standardShippingCost + 79}`}
                  </span>
                </label>
              </div>
            </div>

            {/* Step 4: Order Notes */}
            <div className="bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-7 h-7 bg-purple-50 text-purple-700 rounded-full font-bold text-xs flex-shrink-0">4</div>
                <h2 className="font-bold text-gray-900 text-[15px] flex items-center gap-1.5">
                  Order Notes <span className="font-normal text-gray-400 text-xs">(Optional)</span>
                </h2>
              </div>
              <div>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value.slice(0, 200))}
                  placeholder="Add special instructions for delivery (optional)"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 text-[13px] resize-none placeholder-gray-400"
                  rows="3"
                  maxLength={200}
                ></textarea>
                <p className="text-[11px] text-gray-400 mt-2 text-right">{orderNotes.length}/200</p>
              </div>
            </div>
          </div>

          {/* Right column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 sm:p-6 sticky top-24 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <h2 className="text-[15px] font-bold text-gray-900">Order Summary ({cartItems.reduce((a, i) => a + i.quantity, 0)} Items)</h2>
                <button onClick={() => navigate('/cart')} className="text-purple-600 text-[11px] font-semibold flex-shrink-0 hover:underline tracking-wide">Edit Cart</button>
              </div>

              <div className="space-y-4">
                {cartItems.length > 0 ? cartItems.map((item) => (
                  <div key={item.cartId} className="flex justify-between gap-4">
                    <div className="flex gap-4 min-w-0">
                      <div className="w-[60px] h-[75px] bg-gray-100 rounded-md flex-shrink-0 overflow-hidden shadow-sm">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex flex-col justify-center gap-1">
                        <p className="font-bold text-gray-900 text-[13px] line-clamp-1">{item.name}</p>
                        <p className="text-gray-500 text-[11px]">{item.color} {item.color && item.size ? '/' : ''} {item.size}</p>
                        <p className="text-gray-500 text-[11px]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <p className="font-bold text-gray-900 text-[13px] whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">Your cart is empty.</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-bold text-gray-900 mb-4 text-[14px]">Price Details</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Total MRP</span>
                    <span className="text-gray-600 font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Discount on MRP</span>
                    <span className="text-green-500 font-medium">- ₹{discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Shipping Charges</span>
                    <span className={shippingCost === 0 ? 'text-green-500 font-bold' : 'text-gray-900 font-medium'}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-lg font-bold text-gray-900">To Pay</span>
                  <span className="text-2xl font-black text-[#e83e8c]">₹{total.toLocaleString()}</span>
                </div>
                <p className="text-green-500 text-[11px] font-bold">
                  You Save ₹{discount.toLocaleString()} ({savePercent}%)
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="flex flex-col items-center gap-2">
                  <Lock size={18} className="text-gray-600 stroke-[2]" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 leading-tight mb-0.5">Secure Payments</p>
                    <p className="text-[9px] text-gray-600 leading-tight">100% secure transactions</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Package size={18} className="text-gray-600 stroke-[2]" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 leading-tight mb-0.5">Discreet Packaging</p>
                    <p className="text-[9px] text-gray-600 leading-tight">No product info on package</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw size={18} className="text-gray-600 stroke-[2]" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 leading-tight mb-0.5">Easy Returns</p>
                    <p className="text-[9px] text-gray-600 leading-tight">7 days return policy</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handlePlaceOrder}
                  disabled={cartItems.length === 0 || isPlacing || !selectedAddressId}
                  className="w-full bg-gradient-to-r from-[#8a2be2] to-[#e83e8c] text-white font-bold text-[16px] py-[18px] rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wide flex items-center justify-center gap-2"
                >
                  {isPlacing ? <Loader2 size={18} className="animate-spin" /> : 'BUY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
