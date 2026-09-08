import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Trash2, Plus, Minus, ArrowLeft, CheckCircle2, Zap,
  ShieldCheck, Package, RefreshCw, ShoppingCart, Star, Heart,
} from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { getColorName } from '../data/colorUtils'

export default function CartPage() {
  const navigate = useNavigate()
  const {
    cartItems, updateQuantity, removeFromCart,
    cartSubtotal, cartDiscount, addToCart, toggleWishlist, isWishlisted, products,
  } = useShop()

  // "Saved for later" is a lightweight local list seeded from the removed
  // cart item so a user can move something out of the cart without losing it.
  const [savedItems, setSavedItems] = useState([])
  const [itemToDelete, setItemToDelete] = useState(null)

  const youMayAlsoLike = products.filter((p) => p.isBestSeller).slice(0, 6)

  const saveForLater = (item) => {
    setSavedItems(prev => [...prev, item])
    removeFromCart(item.cartId)
  }

  const moveToCart = (item) => {
    addToCart(item, { quantity: 1, color: item.color, size: item.size })
    setSavedItems(prev => prev.filter(i => i.cartId !== item.cartId))
  }

  const moveAllSavedToCart = () => {
    savedItems.forEach(item => addToCart(item, { quantity: 1, color: item.color, size: item.size }))
    setSavedItems([])
  }

  const removeSaved = (cartId) => {
    setSavedItems(prev => prev.filter(i => i.cartId !== cartId))
  }

  const subtotal = cartSubtotal
  const discount = cartDiscount
  const total = subtotal - discount
  
  const FREE_SHIPPING_THRESHOLD = 999
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shippingCost = freeShipping ? 0 : 200
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
  const discountPct = subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-5">

            {cartItems.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                {cartItems.map((item, idx) => {
                  const savedPerUnit = Math.max(0, (item.originalPrice ?? item.price) - item.price)
                  const discountStr = item.discount || (savedPerUnit > 0 ? `${Math.round((savedPerUnit/(item.originalPrice||1))*100)}% OFF` : null)
                  
                  return (
                    <div key={item.cartId} className={`p-5 flex gap-4 ${idx !== cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div className="w-[100px] h-[100px] bg-[#d3d3d3] rounded-lg flex-shrink-0 overflow-hidden shadow-sm">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-[13px] line-clamp-1 mb-1">{item.name}</h3>
                            <p className="text-[11px] text-gray-500 mb-1.5">{item.color} {item.color && item.size ? '/' : ''} {item.size}</p>
                            <p className="flex items-center gap-1.5 text-[11px] text-[#00b368] font-bold">
                              <span className="w-[5px] h-[5px] rounded-full bg-[#00b368] inline-block"></span> In Stock
                            </p>
                          </div>
                          <button onClick={() => setItemToDelete(item)} className="text-gray-400 hover:text-red-500 transition-colors p-1" aria-label="Remove item">
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        </div>

                        <div className="flex items-end justify-between mt-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="font-bold text-gray-900 text-[15px]">₹{item.price.toLocaleString()}</span>
                              {item.originalPrice > item.price && (
                                <span className="text-gray-400 line-through text-[11px]">₹{item.originalPrice.toLocaleString()}</span>
                              )}
                              {discountStr && <span className="text-[#00b368] text-[11px] font-bold">-{discountStr}</span>}
                            </div>
                            {savedPerUnit > 0 && (
                              <span className="inline-block text-[10px] font-bold text-[#ff4d4d] bg-[#ffe6e6] rounded px-1.5 py-0.5">
                                You save ₹{(savedPerUnit * item.quantity).toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-3 border border-gray-100 rounded-lg bg-gray-50/50 px-2.5 py-1.5">
                              <button onClick={() => updateQuantity(item.cartId, -1)} className="text-gray-500 hover:text-gray-900" aria-label="Decrease quantity">
                                <Minus size={12} strokeWidth={2.5} />
                              </button>
                              <span className="font-bold text-[13px] min-w-[20px] text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.cartId, 1)} className="text-gray-500 hover:text-gray-900" aria-label="Increase quantity">
                                <Plus size={12} strokeWidth={2.5} />
                              </button>
                            </div>
                            <p className="font-bold text-gray-900 text-[13px]">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-xl font-black text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Looks like you haven't added anything yet.</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors inline-block"
                >
                  Start Shopping
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-900 font-bold text-[13px] bg-white border border-gray-100 shadow-sm rounded-xl px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} /> Continue Shopping
              </button>
              {cartItems.length > 0 && (
                <button
                  onClick={() => cartItems.forEach(item => removeFromCart(item.cartId))}
                  className="flex items-center gap-2 text-purple-600 font-bold text-[13px] bg-purple-50 rounded-xl px-5 py-3 hover:bg-purple-100 transition-colors"
                >
                  <Trash2 size={16} /> Clear Cart
                </button>
              )}
            </div>

            <div className="bg-[#e6fcf2] border border-[#baf0d6] rounded-xl p-4">
              <div className="flex items-center justify-between gap-2 text-[12px] flex-wrap mb-2.5">
                {freeShipping ? (
                  <span className="flex items-center gap-1.5 text-[#00b368] font-bold w-full justify-center text-sm py-1">
                    <CheckCircle2 size={18} /> Yay! You are eligible for FREE shipping
                  </span>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 text-gray-800 font-bold">
                      FREE Shipping
                    </span>
                    <span className="text-gray-600">
                      Add <span className="font-bold text-[#00b368]">₹{amountNeeded.toLocaleString()}</span> more
                    </span>
                  </>
                )}
              </div>
              <div className="w-full h-1.5 bg-[#baf0d6] rounded-full overflow-hidden">
                <div className="h-full bg-[#00b368] rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 sm:p-6 sticky top-24 space-y-6">
              <h2 className="text-[15px] font-bold text-gray-900">Order Summary</h2>

              <div className="space-y-4 border-b border-gray-100 pb-5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-gray-500">Subtotal ({cartItems.reduce((a, i) => a + i.quantity, 0)} Items)</span>
                  <span className="font-medium text-gray-600">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-gray-500">Discount on MRP</span>
                  <span className="text-[#00b368] font-medium">- ₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-gray-500">Shipping Charges</span>
                  <span className={freeShipping ? 'text-[#00b368] font-bold' : 'text-gray-900 font-medium'}>
                    {freeShipping ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-900 text-[14px]">Total Amount</span>
                  <span className="font-black text-[#e83e8c] text-[22px]">₹{(total + shippingCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#00b368] font-bold">You Save</span>
                  <span className="text-[#00b368] font-bold">₹{discount.toLocaleString()} ({discountPct}%)</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-[#e83e8c] text-white py-3.5 rounded-xl font-bold text-[14px] hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap size={16} className="fill-white" /> Proceed to Checkout
                </button>

                <button onClick={() => navigate('/checkout')} className="w-full flex items-center justify-center gap-2 border border-purple-200 bg-purple-50/50 text-purple-600 py-3.5 rounded-xl font-bold text-[14px] hover:bg-purple-50 transition-colors">
                  <ShieldCheck size={16} /> Buy with 1-Click
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-5 border-t border-gray-100">
                <div className="flex flex-col items-center gap-1.5">
                  <ShieldCheck size={18} className="text-gray-600 stroke-[2]" />
                  <p className="text-[11px] font-bold text-gray-900 leading-tight">Secure Payments</p>
                  <p className="text-[9px] text-gray-600 leading-tight">100% secure transactions</p>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Package size={18} className="text-gray-600 stroke-[2]" />
                  <p className="text-[11px] font-bold text-gray-900 leading-tight">Discreet Packaging</p>
                  <p className="text-[9px] text-gray-600 leading-tight">No product info on package</p>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <RefreshCw size={18} className="text-gray-600 stroke-[2]" />
                  <p className="text-[11px] font-bold text-gray-900 leading-tight">Easy Returns</p>
                  <p className="text-[9px] text-gray-600 leading-tight">7 days return policy</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm mt-4">
                <div className="text-[12px] min-w-0">
                  <p className="font-bold text-gray-900 mb-0.5 text-[12px]">Yay! You will earn</p>
                  <p className="text-purple-600 font-bold text-[15px] mb-1">45 She Points</p>
                  <p className="text-gray-600 text-[10px] leading-tight">These points will be credited after order delivery</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-400 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm shadow-sm">
                  S
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[11px] text-gray-500 mb-2">We Accept</p>
                <div className="flex items-center gap-3 text-[11px] font-bold flex-wrap">
                  <span className="text-[#1a1f71] font-black text-[13px]">VISA</span>
                  <span className="flex -space-x-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b] inline-block"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#f79e1b] inline-block"></span>
                  </span>
                  <span className="text-[#1a1f71]">RuPay</span>
                  <span className="border border-gray-300 rounded px-1.5 py-0.5 text-[9px] text-gray-700">UPI</span>
                  <span className="text-[#00baf2]">Paytm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Full Width Sections Below The Grid --- */}
        <div className="mt-12 space-y-12">
          {savedItems.length > 0 && (
            <div>
              <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-lg font-bold text-gray-900">Saved for Later <span className="text-gray-500 font-normal text-sm">({savedItems.length} Items)</span></h2>
                <button onClick={moveAllSavedToCart} className="text-purple-600 font-medium text-[13px] hover:underline">Move All to Cart</button>
              </div>

              <div className="flex overflow-x-auto gap-5 pb-4 snap-x">
                {savedItems.map(item => (
                  <div key={item.cartId} className="bg-white rounded-[16px] p-4 border border-gray-200 shadow-sm flex w-[290px] md:w-[380px] flex-shrink-0 snap-start gap-3 md:gap-4">
                    <div className="w-[80px] md:w-[96px] h-[100px] md:h-[128px] bg-[#c4c4c4] rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-[13px] text-gray-900 line-clamp-1 mb-0.5">{item.name}</h4>
                        <p className="text-gray-500 text-[11px] mb-2">{item.color} {item.color && item.size ? '/' : ''} {item.size}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[14px] text-gray-900">₹{item.price.toLocaleString()}</span>
                          {item.originalPrice > item.price && <span className="line-through text-gray-400 text-[11px]">₹{item.originalPrice.toLocaleString()}</span>}
                          {item.discount && <span className="text-[#00b368] text-[11px] font-bold">{item.discount}</span>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => moveToCart(item)}
                          className="flex-1 text-purple-600 border border-purple-300 bg-white rounded-lg py-1.5 text-[12px] font-bold hover:bg-purple-50 transition-colors"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeSaved(item.cartId)}
                          className="border border-gray-200 bg-white rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-3">
              <h2 className="text-[15px] font-bold text-gray-900">You May Also Like</h2>
              <button onClick={() => navigate('/category/Best-Sellers')} className="text-purple-600 font-medium text-[12px] hover:underline">View All</button>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-6 snap-x">
              {youMayAlsoLike.map(item => (
                <div key={item.id} className="w-[180px] sm:w-[200px] flex-shrink-0 snap-start group cursor-pointer">
                  <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-3">
                    <button onClick={() => navigate(`/product/${item.id}`)} className="w-full h-full block">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(item) }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-pink-500 transition-colors z-10"
                    >
                      <Heart size={16} fill={isWishlisted(item.id) ? 'currentColor' : 'none'} className={isWishlisted(item.id) ? 'text-pink-500' : ''} />
                    </button>
                  </div>
                  <div className="px-1">
                    <h4 className="font-bold text-[12px] text-gray-900 line-clamp-1 mb-1">{item.name}</h4>
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <span className="font-bold text-[13px] text-gray-900">₹{item.price.toLocaleString()}</span>
                      <span className="line-through text-gray-400 text-[10px]">₹{item.originalPrice.toLocaleString()}</span>
                      <span className="text-[#00b368] text-[10px] font-bold">{item.discount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" /> {item.rating} ({item.reviews})
                      </span>
                      <button
                        onClick={() => addToCart(item, { quantity: 1, color: getColorName(item.colors?.[0]), size: item.sizes?.[0] })}
                        className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-colors flex-shrink-0"
                      >
                        <ShoppingCart size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete / Save for Later Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-[340px] w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-[17px] font-bold text-gray-900 mb-2">Remove Item?</h3>
            <p className="text-gray-500 text-[13px] mb-6">Are you sure you want to remove this item from your cart?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  removeFromCart(itemToDelete.cartId)
                  setItemToDelete(null)
                }}
                className="flex-1 px-4 py-2.5 border border-red-200 bg-red-50 rounded-lg text-[13px] font-bold text-red-600 hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={() => {
                  saveForLater(itemToDelete)
                  setItemToDelete(null)
                }}
                className="flex-1 px-4 py-2.5 bg-[#7e57c2] text-white rounded-lg text-[13px] font-bold hover:bg-[#6b47a9] transition-colors whitespace-nowrap"
              >
                Save for later
              </button>
            </div>
            <button 
              onClick={() => setItemToDelete(null)}
              className="w-full mt-3 px-4 py-2.5 text-[13px] font-bold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
