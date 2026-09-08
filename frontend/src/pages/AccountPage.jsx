import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import profileService from '../services/profileService'
import orderService from '../services/orderService'
import addressService from '../services/addressService'
import reviewService from '../services/reviewService'
import paymentMethodService from '../services/paymentMethodService'
import preferencesService from '../services/preferencesService'
import {
  User, ShoppingBag, Heart, MapPin, CreditCard, Settings, Clock,
  Star, Shield, Bell, HelpCircle, LogOut, Edit2, CheckCircle2,
  MessageCircle, Gift, Edit, Trash2,
  Plus, Package, Eye, RotateCcw, ThumbsUp, Smartphone,
  Globe, Phone, Mail, ChevronDown, X, Home, Briefcase,
  AlertCircle, CheckCheck, XCircle, MoreHorizontal, Menu, Loader2
} from 'lucide-react'

const MENU = [
  { id: 'profile',        label: 'My Profile',            icon: User },
  { id: 'orders',         label: 'Orders',                icon: ShoppingBag },
  { id: 'wishlist',       label: 'Wishlist',              icon: Heart, badge: true },
  { id: 'addresses',      label: 'Addresses',             icon: MapPin },
  { id: 'payments',       label: 'Payment Methods',       icon: CreditCard },
  { id: 'interests',      label: 'Interest Profile',      icon: Settings },
  { id: 'recent',         label: 'Recently Viewed',       icon: Clock },
  { id: 'reviews',        label: 'Reviews & Ratings',     icon: Star },
  // { id: 'privacy',        label: 'Privacy Settings',      icon: Shield },
  { id: 'notifications',  label: 'Notification Settings', icon: Bell },
  { id: 'help',           label: 'Help Center',           icon: HelpCircle },
]

// Recently viewed helper — stores up to 8 product IDs in localStorage (most recent first)
export function trackProductView(productId) {
  try {
    const key = 'hashtelicom_recent'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const filtered = existing.filter((id) => id !== String(productId))
    const updated = [String(productId), ...filtered].slice(0, 8)
    localStorage.setItem(key, JSON.stringify(updated))
  } catch {}
}

function getRecentIds() {
  try { return JSON.parse(localStorage.getItem('hashtelicom_recent') || '[]') } catch { return [] }
}

const INTERESTS_ALL = ['Smartphones', 'Laptops & MacBooks', 'Audio & Headphones', 'Tablets & iPads', 'Smartwatches', 'Gaming', 'Fast Chargers & Power', 'Cases & Protection', 'Wellness', 'Gift Sets']

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-purple-500' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}

function Stars({ rating, size = 12 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => <Star key={s} size={size} className={s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />)}
    </div>
  )
}

// ─── PROFILE PANEL ────────────────────────────────────────────────────────────
function ProfilePanel() {
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const formRef = useRef(null)
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    gender: user?.gender || '',
    mobile: user?.mobileNumber || '',
    language: 'English',
  })
  const [totalOrders, setTotalOrders] = useState(0)
  const fieldChange = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const fileInputRef = useRef(null)
  const [dp, setDp] = useState(user?.profilePicture || null)
  const { showToast, toggleWishlist, isWishlisted, products } = useShop()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.fullName || '',
        email: user.email || '',
        gender: user.gender || '',
        mobile: user.mobileNumber || '',
      }))
      if (user.profilePicture) setDp(user.profilePicture)
    }
  }, [user])

  useEffect(() => {
    profileService
      .getProfile()
      .then((res) => {
        setTotalOrders(res.data.totalOrders || 0)
        if (res.data) {
          const u = res.data
          setUser(prev => ({ ...prev, ...u }))
          setForm(prev => ({
            ...prev,
            name: u.fullName || prev.name,
            email: u.email || prev.email,
            gender: u.gender || prev.gender,
            mobile: u.mobileNumber || prev.mobile,
          }))
          if (u.profilePicture) setDp(u.profilePicture)
        }
      })
      .catch(() => {})
  }, [setUser])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setDp(URL.createObjectURL(file))
    profileService.updateProfilePicture(file)
      .then((res) => {
        setDp(res.data.profilePicture)
        setUser((prev) => ({ ...prev, profilePicture: res.data.profilePicture }))
        showToast('Profile picture updated successfully!')
      })
      .catch((err) => showToast(err.message))
  }

  const handleSaveProfile = () => {
    profileService.updateProfile({ fullName: form.name, gender: form.gender })
      .then((res) => {
        const updated = res.data.user || res.data
        setUser((prev) => ({ ...prev, ...updated }))
        setForm(prev => ({
          ...prev,
          name: updated.fullName || prev.name,
          gender: updated.gender || prev.gender,
        }))
        showToast('Profile updated successfully!')
        setEditing(false)
      })
      .catch((err) => showToast(err.message))
  }

  const handleChangePassword = () => {
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match')
      return
    }
    profileService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      .then(() => {
        showToast('Password changed successfully!')
        setChangingPassword(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      })
      .catch((err) => showToast(err.message))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your personal details and preferences</p>
        </div>
        <button 
          onClick={() => {
            setEditing(!editing)
            if (!editing) {
              setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
            }
          }} 
          className="hidden md:flex bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold items-center gap-2 text-sm shadow hover:shadow-md transition"
        >
          <Edit2 size={15} /> {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl font-black select-none overflow-hidden">
                {dp ? <img src={dp} alt="Profile" className="w-full h-full object-cover" /> : (form.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U')}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition">
                <Edit2 size={11} className="text-purple-500" />
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-lg">{form.name}</h3>
              <p className="text-gray-400 text-sm mt-0.5 truncate">{form.email}</p>
              <p className="text-gray-400 text-sm mt-0.5">{form.mobile}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 flex gap-3">
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1 flex items-center gap-3">
              <Clock size={18} className="text-gray-300 flex-shrink-0" />
              <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none mb-1">MEMBER SINCE</p><p className="font-bold text-gray-800 text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}</p></div>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1 flex items-center gap-3">
              <ShoppingBag size={18} className="text-gray-300 flex-shrink-0" />
              <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none mb-1">TOTAL ORDERS</p><p className="font-bold text-gray-800 text-sm">{totalOrders} Orders</p></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center"><Shield size={20} className="text-green-500" /></div>
            <div>
              <h3 className="font-bold text-gray-900">Account Security</h3>
              <p className="text-green-600 text-xs font-semibold flex items-center gap-1 mt-0.5">Your account is secure <CheckCircle2 size={12} /></p>
            </div>
          </div>
          <div className="space-y-4">
            {changingPassword ? (
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400" />
                <input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400" />
                <input type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400" />
                <div className="flex gap-2">
                  <button onClick={handleChangePassword} className="flex-1 bg-purple-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-purple-700 transition">Save</button>
                  <button onClick={() => setChangingPassword(false)} className="flex-1 bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                </div>
              </div>
            ) : (
              [
                { label: 'Password', right: <div className="flex items-center gap-3"><span className="text-gray-800 tracking-[0.15em]">........</span><button onClick={() => setChangingPassword(true)} className="text-purple-600 text-xs font-bold hover:underline">Change</button></div> },
                { label: 'Email',   right: <span className="text-green-600 text-xs font-semibold flex items-center gap-1">Verified <CheckCircle2 size={12} /></span> },
                { label: 'Mobile',  right: <span className="text-green-600 text-xs font-semibold flex items-center gap-1">Verified <CheckCircle2 size={12} /></span> },
              ].map(({ label, right }) => (
                <div key={label} className="flex justify-between items-center pb-3 border-b border-dashed border-gray-100 last:border-0 last:pb-0">
                  <span className="text-gray-500 text-sm">{label}</span>
                  {right}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div ref={formRef} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm scroll-mt-24">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Personal Details</h3>
          {editing
            ? <button onClick={handleSaveProfile} className="bg-purple-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-purple-700 transition">Save</button>
            : <button onClick={() => setEditing(true)} className="text-purple-600 text-sm font-semibold hover:underline">Edit</button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
          {[
            { icon: <User size={17} className="text-gray-400 mt-0.5" />,  label: 'Full Name', field: 'name' },
            { icon: <Mail size={17} className="text-gray-400 mt-0.5" />,  label: 'Email', field: 'email', readOnly: true },
            { icon: <User size={17} className="text-gray-400 mt-0.5" />,  label: 'Gender', field: 'gender' },
            { icon: <Phone size={17} className="text-gray-400 mt-0.5" />, label: 'Mobile Number', field: 'mobile', readOnly: true },
            { icon: <Globe size={17} className="text-gray-400 mt-0.5" />, label: 'Preferred Language', field: 'language' },
          ].map(({ icon, label, field, readOnly }) => (
            <div key={field} className="flex items-start gap-3">
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                {editing && !readOnly ? (
                  field === 'gender' ? (
                    <select
                      value={form.gender}
                      onChange={(e) => fieldChange('gender', e.target.value)}
                      className="w-full text-sm font-semibold text-gray-900 border border-purple-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input
                      value={form[field]}
                      onChange={(e) => fieldChange(field, e.target.value)}
                      className="w-full text-sm font-semibold text-gray-900 border border-purple-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  )
                ) : (
                  <p className="font-semibold text-gray-900 text-sm">{form[field] || '—'}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Embedded Interests */}
      <InterestsPanel embedded />

      {/* Recommended */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div><h3 className="font-bold text-gray-900 text-lg">Recommended for You</h3><p className="text-gray-400 text-sm mt-0.5">Based on your interest and activity</p></div>
          <button onClick={() => navigate('/category/Clothing')} className="text-purple-600 text-sm font-semibold hover:underline">View All</button>
        </div>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {products.filter((p) => p.isBestSeller).slice(0, 5).map((p) => (
                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="snap-start min-w-[180px] w-[180px] flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                  <div className="h-[180px] bg-gray-100 relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }} 
                      className={`absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center transition ${isWishlisted(p.id) ? 'text-red-500 bg-white' : 'text-gray-400 hover:text-red-500 hover:bg-white'}`}
                    >
                      <Heart size={13} fill={isWishlisted(p.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-[13px] mb-1 line-clamp-2 min-h-[38px] leading-snug">{p.name}</h4>
                      <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
                        <span className="font-black text-gray-900 text-sm">₹{p.price}</span>
                        <span className="text-gray-400 text-[11px] line-through">₹{p.originalPrice}</span>
                        <span className="text-red-500 text-[10px] font-bold">{p.discount}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-3"><Star size={10} className="text-yellow-400 fill-yellow-400" /><span className="text-gray-400 text-[10px]">({p.reviews})</span></div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/product/${p.id}`) }} 
                      className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition py-1.5 rounded-lg text-xs font-bold"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ORDERS PANEL ─────────────────────────────────────────────────────────────
function OrdersPanel() {
  const [filter, setFilter] = useState('All')
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [trackModal, setTrackModal] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const { showToast, addToCart, getProductById } = useShop()
  const filters = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  const mapOrder = (o) => {
    const firstItem = o.items?.[0] || {}
    return {
      id: o._id,
      orderNumber: o.orderId,
      date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: o.status,
      items: o.items?.length || 0,
      itemsList: o.items || [],
      total: o.total,
      image: firstItem.image || '',
      product: firstItem.name ? (o.items.length > 1 ? `${firstItem.name} +${o.items.length - 1} more` : firstItem.name) : '—',
      address: o.shippingAddress ? `${o.shippingAddress.addressLine}, ${o.shippingAddress.city}, ${o.shippingAddress.state} - ${o.shippingAddress.pincode}` : '',
      tracking: (o.statusHistory || []).map((s) => ({
        label: s.status,
        date: new Date(s.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        done: true,
      })),
    }
  }

  const loadOrders = () => {
    setIsLoading(true)
    orderService.getMyOrders()
      .then((res) => setOrders((res.data.orders || []).map(mapOrder)))
      .catch((err) => showToast(err.message))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { loadOrders() }, [])

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  const statusColor = (s) => {
    if (s === 'Delivered') return 'bg-green-100 text-green-700'
    if (s === 'Shipped') return 'bg-blue-100 text-blue-700'
    if (s === 'Processing') return 'bg-amber-100 text-amber-700'
    if (s === 'Cancelled') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  const cancelOrder = (orderId) => {
    orderService.cancelOrder(orderId)
      .then(() => {
        showToast('Order cancelled successfully.')
        setCancelModal(null)
        loadOrders()
      })
      .catch((err) => showToast(err.message))
  }

  const handleReorder = (order) => {
    order.itemsList.forEach((item) => {
      const product = getProductById(item.product)
      if (product) addToCart(product, { quantity: item.quantity, color: item.color, size: item.size })
    })
    showToast(`${order.product} added to cart!`)
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={28} /></div>
  }

  return (
    <div className="flex flex-col gap-5">
      <div><h2 className="text-2xl font-black text-gray-900">My Orders</h2><p className="text-gray-400 text-sm mt-0.5">Track and manage your orders</p></div>
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${filter === f ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'}`}>{f}</button>
        ))}
      </div>
      {filtered.length === 0 && <div className="bg-white rounded-2xl p-12 text-center border border-gray-100"><Package size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-semibold">No orders found</p></div>}
      <div className="flex flex-col gap-4">
        {filtered.map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-4">
              <img src={order.image} alt={order.product} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{order.product}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{order.items} item{order.items > 1 ? 's' : ''} · {order.orderNumber}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{order.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-gray-900">₹{order.total.toLocaleString()}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>{order.status}</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                  <button onClick={() => setTrackModal(order)} className="text-purple-600 text-xs font-bold hover:underline flex items-center gap-1"><Eye size={12} /> Track Order</button>
                  {order.status !== 'Cancelled' && (
                    <button onClick={() => handleReorder(order)} className="text-gray-500 text-xs font-bold hover:underline flex items-center gap-1"><RotateCcw size={12} /> Reorder</button>
                  )}
                  {order.status === 'Delivered' && <button className="text-gray-500 text-xs font-bold hover:underline flex items-center gap-1"><ThumbsUp size={12} /> Rate</button>}
                  {(order.status === 'Pending' || order.status === 'Processing') && (
                    <button onClick={() => setCancelModal(order)} className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1"><X size={12} /> Cancel</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Track Order Modal */}
      {trackModal && (
        <Modal title={`Tracking: ${trackModal.orderNumber}`} onClose={() => setTrackModal(null)}>
          <div className="mb-4">
            <img src={trackModal.image} alt={trackModal.product} className="w-16 h-16 rounded-xl object-cover" />
            <p className="font-bold text-gray-900 mt-2">{trackModal.product}</p>
            <p className="text-gray-400 text-xs">{trackModal.address}</p>
          </div>
          <div className="relative pl-6">
            {trackModal.tracking.map((step, i) => (
              <div key={i} className="relative mb-5 last:mb-0">
                <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${step.done ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}>
                  {step.done && <span className="text-white text-[8px]">✓</span>}
                </div>
                {i < trackModal.tracking.length - 1 && (
                  <div className={`absolute -left-[18px] top-5 w-0.5 h-[calc(100%+4px)] ${step.done ? 'bg-purple-300' : 'bg-gray-200'}`} />
                )}
                <p className={`font-bold text-sm ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                <p className="text-gray-400 text-xs">{step.date}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Cancel Order Modal */}
      {cancelModal && (
        <Modal title="Cancel Order?" onClose={() => setCancelModal(null)}>
          <p className="text-gray-600 text-sm mb-4">Are you sure you want to cancel <strong>{cancelModal.product}</strong>?</p>
          <div className="flex gap-3">
            <button onClick={() => setCancelModal(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Keep Order</button>
            <button onClick={() => cancelOrder(cancelModal.id)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600">Yes, Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── WISHLIST PANEL ───────────────────────────────────────────────────────────
function WishlistPanel() {
  const { wishlistItems, addToCart, removeFromWishlist, moveWishlistItemToCart, moveAllWishlistToCart, showToast } = useShop()
  const navigate = useNavigate()
  const items = wishlistItems
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black text-gray-900">My Wishlist</h2><p className="text-gray-400 text-sm mt-0.5">{items.length} saved items</p></div>
        {items.length > 0 && <button onClick={moveAllWishlistToCart} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-700 transition">Move All to Cart</button>}
      </div>
      {items.length === 0 && <div className="bg-white rounded-2xl p-12 text-center border border-gray-100"><Heart size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-semibold">Your wishlist is empty</p></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} onClick={() => navigate(`/product/${item.id}`)} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="relative h-[200px] bg-gray-100">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <button onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id); showToast('Removed from wishlist') }} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow text-red-500 hover:bg-red-50 transition"><X size={14} /></button>
            </div>
            <div className="p-4">
              <p className="text-purple-600 text-[10px] font-black uppercase tracking-wider">{item.brand}</p>
              <p className="font-semibold text-gray-900 text-sm mt-0.5 line-clamp-2 leading-snug">{item.name}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-black text-gray-900">₹{item.price.toLocaleString()}</span>
                <span className="text-gray-400 text-xs line-through">₹{item.originalPrice.toLocaleString()}</span>
                <span className="text-red-500 text-[10px] font-bold">{item.discount}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); moveWishlistItemToCart(item); showToast('Moved to cart!') }} className="w-full mt-3 bg-purple-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-purple-700 transition">Move to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PAYMENTS PANEL ───────────────────────────────────────────────────────────
function PaymentsPanel() {
  const [methods, setMethods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [addCardModal, setAddCardModal] = useState(false)
  const [addUpiModal, setAddUpiModal] = useState(false)
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [upiInput, setUpiInput] = useState('')
  const { showToast } = useShop()

  const cards = methods.filter(m => m.type === 'card')
  const upis = methods.filter(m => m.type === 'upi')

  useEffect(() => {
    paymentMethodService.getPaymentMethods()
      .then((res) => setMethods(res.data.paymentMethods || []))
      .catch((err) => showToast(err.message))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddCard = () => {
    if (!cardForm.number || !cardForm.name || !cardForm.expiry) return showToast('Please fill all fields')
    paymentMethodService.addCard(cardForm.number, cardForm.name, cardForm.expiry)
      .then((res) => {
        setMethods(res.data.paymentMethods || [])
        setAddCardModal(false)
        setCardForm({ number: '', name: '', expiry: '', cvv: '' })
        showToast('Card added successfully!')
      })
      .catch((err) => showToast(err.message))
  }

  const handleAddUpi = () => {
    if (!upiInput.includes('@')) return showToast('Please enter a valid UPI ID')
    paymentMethodService.addUpi(upiInput)
      .then((res) => {
        setMethods(res.data.paymentMethods || [])
        setAddUpiModal(false)
        setUpiInput('')
        showToast('UPI ID added successfully!')
      })
      .catch((err) => showToast(err.message))
  }

  const handleRemove = (id, label) => {
    paymentMethodService.deletePaymentMethod(id)
      .then((res) => {
        setMethods(res.data.paymentMethods || [])
        showToast(`${label} removed`)
      })
      .catch((err) => showToast(err.message))
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={28} /></div>
  }

  return (
    <div className="flex flex-col gap-5">
      <div><h2 className="text-2xl font-black text-gray-900">Payment Methods</h2><p className="text-gray-400 text-sm mt-0.5">Your saved cards and UPI IDs</p></div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Saved Cards</h3>
          <button onClick={() => setAddCardModal(true)} className="text-purple-600 text-sm font-semibold hover:underline flex items-center gap-1"><Plus size={14} /> Add Card</button>
        </div>
        {cards.map(card => (
          <div key={card._id} className="bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl p-5 text-white relative overflow-hidden group">
            <div className="absolute right-5 top-5 opacity-10"><CreditCard size={52} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">CARD</p>
            <p className="text-lg font-mono tracking-widest mb-4">.... .... .... {card.last4}</p>
            <div className="flex justify-between text-[11px] items-end">
              <div><p className="uppercase tracking-wider opacity-70">Card Holder</p><p className="font-bold text-sm">{card.cardHolderName}</p></div>
              <div className="text-right">
                <p className="uppercase tracking-wider opacity-70">Expires</p><p className="font-bold text-sm">{card.expiry}</p>
              </div>
              <button onClick={() => handleRemove(card._id, 'Card')} className="opacity-0 group-hover:opacity-100 transition text-white/80 hover:text-white text-xs font-bold bg-white/20 px-2 py-1 rounded">Remove</button>
            </div>
          </div>
        ))}
        {cards.length === 0 && <p className="text-gray-400 text-sm">No saved cards yet</p>}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">UPI IDs</h3>
            <button onClick={() => setAddUpiModal(true)} className="text-purple-600 text-sm font-semibold hover:underline flex items-center gap-1"><Plus size={14} /> Add UPI</button>
          </div>
          {upis.map(upi => (
            <div key={upi._id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-2 last:mb-0">
              <div className="flex items-center gap-3"><Smartphone size={17} className="text-purple-500" /><span className="text-sm font-semibold text-gray-800">{upi.upiId}</span></div>
              <button onClick={() => handleRemove(upi._id, 'UPI ID')} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
            </div>
          ))}
          {upis.length === 0 && <p className="text-gray-400 text-sm">No saved UPI IDs yet</p>}
        </div>
      </div>

      {addCardModal && (
        <Modal title="Add New Card" onClose={() => setAddCardModal(false)}>
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-gray-700 block mb-1">Card Number</label>
              <input type="text" maxLength={19} value={cardForm.number} onChange={e => setCardForm(f => ({ ...f, number: e.target.value.replace(/[^\d\s]/g,'').slice(0,19) }))} placeholder="1234 5678 9012 3456" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" /></div>
            <div><label className="text-xs font-semibold text-gray-700 block mb-1">Name on Card</label>
              <input type="text" value={cardForm.name} onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))} placeholder="Rahul Sharma" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-gray-700 block mb-1">Expiry (MM/YY)</label>
                <input type="text" maxLength={5} value={cardForm.expiry} onChange={e => setCardForm(f => ({ ...f, expiry: e.target.value }))} placeholder="12/26" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" /></div>
              <div><label className="text-xs font-semibold text-gray-700 block mb-1">CVV</label>
                <input type="password" maxLength={4} value={cardForm.cvv} onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value }))} placeholder="•••" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" /></div>
            </div>
            <button onClick={handleAddCard} className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 transition mt-2">Add Card</button>
          </div>
        </Modal>
      )}

      {addUpiModal && (
        <Modal title="Add UPI ID" onClose={() => setAddUpiModal(false)}>
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-gray-700 block mb-1">UPI ID</label>
              <input type="text" value={upiInput} onChange={e => setUpiInput(e.target.value)} placeholder="yourname@upi" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" /></div>
            <button onClick={handleAddUpi} className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 transition">Add UPI ID</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── INTERESTS PANEL ──────────────────────────────────────────────────────────
function InterestsPanel({ embedded = false }) {
  const { user, setUser } = useAuth()
  const [selected, setSelected] = useState(() => user?.interests?.length ? user.interests : ['Smartphones', 'Audio & Headphones', 'Laptops & MacBooks'])
  const { showToast } = useShop()
  const toggle = (i) => setSelected(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])

  const handleSave = () => {
    profileService.updateProfile({ interests: selected })
      .then((res) => {
        setUser(res.data.user)
        showToast('Interests saved successfully!')
      })
      .catch((err) => showToast(err.message))
  }

  const inner = (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-bold text-gray-900 ${embedded ? 'text-lg' : 'text-2xl font-black'}`}>My Interest Profile</h3>
          <p className="text-gray-400 text-sm mt-0.5">We use your interests to recommend products you'll love</p>
        </div>
        <button onClick={handleSave} className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-purple-700 transition whitespace-nowrap">Save Interests</button>
      </div>
      <div className="flex flex-wrap gap-2.5 mb-3">
        {INTERESTS_ALL.map(interest => {
          const on = selected.includes(interest)
          return (
            <button key={interest} onClick={() => toggle(interest)} className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition flex items-center gap-2 ${on ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-500 border-gray-200 hover:border-purple-200'}`}>
              <Heart size={11} className={on ? 'fill-purple-600 text-purple-600' : ''} />
              {interest}
              {on && <CheckCircle2 size={11} className="fill-purple-600 text-white" />}
            </button>
          )
        })}
      </div>
      <p className="text-gray-400 text-xs">Your interests help us personalize your experience and show more relevant products.</p>
    </>
  )

  if (embedded) return <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">{inner}</div>
  return <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">{inner}</div>
}

// ─── RECENT PANEL ─────────────────────────────────────────────────────────────
function RecentPanel() {
  const { addToCart, showToast, toggleWishlist, isWishlisted, products } = useShop()
  const navigate = useNavigate()

  // Load recently viewed product IDs from localStorage and match against real catalog
  const recentItems = getRecentIds()
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)

  return (
    <div className="flex flex-col gap-5">
      <div><h2 className="text-2xl font-black text-gray-900">Recently Viewed</h2><p className="text-gray-400 text-sm mt-0.5">Items you've looked at recently</p></div>
      {recentItems.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Clock size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">No recently viewed items</p>
          <p className="text-gray-300 text-sm mt-1">Browse products to see them here</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentItems.map(item => (
          <div key={item.id} onClick={() => navigate(`/product/${item.id}`)} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col">
            <div className="h-[170px] overflow-hidden relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <button
                onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition z-10 ${isWishlisted(item.id) ? 'bg-white text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
              >
                <Heart size={15} fill={isWishlisted(item.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug mb-2">{item.name}</p>
              <div className="flex items-center gap-1 mb-2"><Stars rating={item.rating} /><span className="text-gray-400 text-[10px] ml-1">{item.rating}</span></div>
              <div className="flex items-baseline gap-1.5 flex-wrap mb-3">
                <span className="font-black text-gray-900 text-sm">₹{(item.price || 0).toLocaleString()}</span>
                {item.originalPrice && item.originalPrice !== item.price && <span className="text-gray-400 text-xs line-through">₹{item.originalPrice.toLocaleString()}</span>}
                {item.discount && <span className="text-red-500 text-[10px] font-bold">{item.discount}</span>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); addToCart(item, { quantity: 1 }); }} className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition py-1.5 rounded-lg text-xs font-bold mt-auto">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── REVIEWS PANEL ────────────────────────────────────────────────────────────
function ReviewsPanel() {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editModal, setEditModal] = useState(null)
  const [editForm, setEditForm] = useState({ rating: 5, title: '', body: '' })
  const { showToast } = useShop()

  useEffect(() => {
    reviewService.getMyReviews()
      .then((res) => setReviews(res.data.reviews || []))
      .catch((err) => showToast(err.message))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openEdit = (review) => {
    setEditForm({ rating: review.rating, title: review.title, body: review.body })
    setEditModal(review)
  }

  const saveEdit = () => {
    reviewService.updateReview(editModal.id, editForm)
      .then((res) => {
        setReviews(prev => prev.map(r => r.id === editModal.id ? res.data.review : r))
        setEditModal(null)
        showToast('Review updated successfully!')
      })
      .catch((err) => showToast(err.message))
  }

  const deleteReview = (id) => {
    reviewService.deleteReview(id)
      .then(() => {
        setReviews(prev => prev.filter(r => r.id !== id))
        showToast('Review deleted')
      })
      .catch((err) => showToast(err.message))
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={28} /></div>
  }

  return (
    <div className="flex flex-col gap-5">
      <div><h2 className="text-2xl font-black text-gray-900">Reviews and Ratings</h2><p className="text-gray-400 text-sm mt-0.5">Your product reviews</p></div>
      {reviews.length === 0 && <div className="bg-white rounded-2xl p-12 text-center border border-gray-100"><Star size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-semibold">No reviews yet</p></div>}
      <div className="flex flex-col gap-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-4">
              <img src={review.productImage} alt={review.productName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-purple-600 text-[10px] font-black uppercase tracking-wider">{review.productBrand}</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{review.productName}</p>
                  </div>
                  <span className="text-gray-400 text-xs flex-shrink-0">{review.date}</span>
                </div>
                <div className="flex items-center gap-2 mt-2"><Stars rating={review.rating} size={13} /><span className="text-xs font-bold text-gray-700">{review.rating}.0</span></div>
                <p className="font-bold text-gray-900 mt-2 text-sm">{review.title}</p>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{review.body}</p>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-gray-400 text-xs">{review.helpful} people found this helpful</span>
                  <button onClick={() => openEdit(review)} className="text-purple-600 text-xs font-bold hover:underline flex items-center gap-1 ml-auto"><Edit size={12} /> Edit</button>
                  <button onClick={() => deleteReview(review.id)} className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editModal && (
        <Modal title="Edit Review" onClose={() => setEditModal(null)}>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Rating</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setEditForm(f => ({ ...f, rating: s }))}>
                    <Star size={24} className={s <= editForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'} />
                  </button>
                ))}
              </div>
            </div>
            <div><label className="text-xs font-semibold text-gray-700 block mb-1">Title</label>
              <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" /></div>
            <div><label className="text-xs font-semibold text-gray-700 block mb-1">Review</label>
              <textarea rows={3} value={editForm.body} onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none" /></div>
            <button onClick={saveEdit} className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 transition">Save Changes</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/*
// ─── PRIVACY PANEL ────────────────────────────────────────────────────────────
function PrivacyPanel() {
  const [settings, setSettings] = useState({ profileVisible: true, showActivity: false, dataSharing: true, personalizedAds: false, emailMarketing: true, smsMarketing: false })
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useShop()

  useEffect(() => {
    preferencesService.getPreferences()
      .then((res) => setSettings(res.data.preferences.privacy))
      .catch((err) => showToast(err.message))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (k, label) => {
    const next = !settings[k]
    setSettings(p => ({ ...p, [k]: next }))
    preferencesService.updatePreferences({ privacy: { [k]: next } })
      .catch((err) => showToast(err.message))
    showToast(`${label} ${next ? 'enabled' : 'disabled'}`)
  }
  const items = [
    { key: 'profileVisible',  label: 'Profile Visibility', desc: 'Allow others to see your profile' },
    { key: 'showActivity',    label: 'Activity Status',    desc: 'Show when you were last active' },
    { key: 'dataSharing',     label: 'Data Sharing',       desc: 'Share anonymous data to improve our service' },
    { key: 'personalizedAds', label: 'Personalized Ads',   desc: 'See ads based on your interests' },
    { key: 'emailMarketing',  label: 'Email Marketing',    desc: 'Receive promotional emails' },
    { key: 'smsMarketing',    label: 'SMS Marketing',      desc: 'Receive promotional SMS' },
  ]

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={28} /></div>
  }

  return (
    <div className="flex flex-col gap-5">
      <div><h2 className="text-2xl font-black text-gray-900">Privacy Settings</h2><p className="text-gray-400 text-sm mt-0.5">Control your privacy and data preferences</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-100">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div><p className="font-semibold text-gray-900 text-sm">{label}</p><p className="text-gray-400 text-xs mt-0.5">{desc}</p></div>
            <button onClick={() => toggle(key, label)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-6 ${settings[key] ? 'bg-purple-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
*/


// ─── NOTIFICATIONS PANEL ──────────────────────────────────────────────────────
function NotificationsPanel() {
  const [settings, setSettings] = useState({ orders: true, offers: true, wishlist: false, reviews: true, security: true, news: false })
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useShop()

  useEffect(() => {
    preferencesService.getPreferences()
      .then((res) => setSettings(res.data.preferences.notifications))
      .catch((err) => showToast(err.message))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (k) => {
    const next = !settings[k]
    setSettings(p => ({ ...p, [k]: next }))
    preferencesService.updatePreferences({ notifications: { [k]: next } })
      .catch((err) => showToast(err.message))
  }
  const items = [
    { key: 'orders',   label: 'Order Updates',     desc: 'Get notified about your order status',   icon: ShoppingBag },
    { key: 'offers',   label: 'Offers & Discounts', desc: 'Exclusive deals and discount alerts',    icon: Gift },
    { key: 'wishlist', label: 'Wishlist Alerts',    desc: 'Price drops on your wishlist items',     icon: Heart },
    { key: 'reviews',  label: 'Review Reminders',   desc: 'Reminders to review your purchases',     icon: Star },
    { key: 'security', label: 'Security Alerts',    desc: 'Important account security updates',     icon: Shield },
    { key: 'news',     label: 'News & Updates',     desc: 'Latest news from Hashtelicom',          icon: Bell },
  ]

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={28} /></div>
  }

  return (
    <div className="flex flex-col gap-5">
      <div><h2 className="text-2xl font-black text-gray-900">Notification Settings</h2><p className="text-gray-400 text-sm mt-0.5">Choose what you want to be notified about</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-100">
        {items.map(({ key, label, desc, icon: Icon }) => (
          <div key={key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0"><Icon size={16} className="text-purple-500" /></div>
            <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 text-sm">{label}</p><p className="text-gray-400 text-xs mt-0.5">{desc}</p></div>
            <button onClick={() => toggle(key)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${settings[key] ? 'bg-purple-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── HELP PANEL ───────────────────────────────────────────────────────────────
function HelpPanel() {
  const [open, setOpen] = useState(null)
  const { setIsChatOpen } = useShop()
  const faqs = [
    { q: 'How do I track my order?',        a: 'Go to My Orders and click Track Order on any active order. You\'ll see real-time updates on your delivery status.' },
    { q: 'What is your return policy?',      a: 'We offer 15-day hassle-free returns on most items. Products must be unused and in original packaging.' },
    { q: 'How long does delivery take?',     a: 'Standard delivery takes 3-5 business days. All orders are delivered in discreet packaging.' },
    { q: 'Is my data safe and private?',     a: 'Yes! We use industry-standard encryption. Your data is never shared with third parties.' },
    { q: 'How do I cancel an order?',        a: 'Orders can be cancelled within 2 hours of placing them. Go to My Orders and click Cancel Order.' },
    { q: 'Can I change my delivery address?', a: 'Yes, you can change the delivery address before the order is shipped from the My Orders section.' },
    { q: 'How do I apply a coupon code?',    a: 'Enter your coupon code in the checkout page before completing payment to get the discount.' },
  ]
  return (
    <div className="flex flex-col gap-5">
      <div><h2 className="text-2xl font-black text-gray-900">Help Center</h2><p className="text-gray-400 text-sm mt-0.5">Find answers to common questions</p></div>
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 flex items-center gap-4">
        <MessageCircle size={30} className="text-purple-500 flex-shrink-0" />
        <div className="flex-1"><p className="font-bold text-gray-900">Need more help?</p><p className="text-gray-500 text-sm">Our AI support team is available 24/7</p></div>
        <button onClick={() => setIsChatOpen(true)} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 transition">Chat Now</button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900">Frequently Asked Questions</h3></div>
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-gray-100 last:border-0">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition">
              <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
              <ChevronDown size={17} className={`text-gray-400 transition-transform flex-shrink-0 ml-4 ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <div className="px-6 pb-4"><p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ADDRESSES PANEL ─────────────────────────────────────────────────────────
const emptyAddressForm = {
  fullName: '',
  mobile: '',
  pincode: '',
  flatHouse: '',
  areaStreet: '',
  landmark: '',
  city: '',
  state: 'Haryana',
  addressType: 'home',
  setAsDefault: false,
}

function AddressesPanel() {
  const [formData, setFormData] = useState(emptyAddressForm)
  const [editingId, setEditingId] = useState(null)
  const [confirmPrimaryId, setConfirmPrimaryId] = useState(null)
  const nameInputRef = useRef(null)
  const { showToast } = useShop()

  const [savedAddresses, setSavedAddresses] = useState([])

  const mapAddr = (a) => {
    const addressText = [a.addressLine, a.landmark, `${a.city}, ${a.state} - ${a.pincode}`].filter(Boolean).join('\n')
    const [flatHouse, ...rest] = (a.addressLine || '').split(', ')
    return {
      id: a._id,
      type: a.isDefault ? 'PRIMARY' : (a.addressType || 'home').toUpperCase(),
      name: a.fullName,
      address: addressText,
      phone: a.mobile,
      raw: {
        fullName: a.fullName, mobile: a.mobile, pincode: a.pincode,
        flatHouse: flatHouse || a.addressLine, areaStreet: rest.join(', '),
        landmark: a.landmark || '', city: a.city, state: a.state,
        addressType: a.addressType || 'home', setAsDefault: !!a.isDefault,
      },
    }
  }

  useEffect(() => {
    addressService.getAddresses()
      .then((res) => setSavedAddresses((res.data.addresses || []).map(mapAddr)))
      .catch((err) => showToast(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetForm = () => {
    setFormData(emptyAddressForm)
    setEditingId(null)
    if (nameInputRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => nameInputRef.current.focus(), 300)
    }
  }

  const handleEdit = (addr) => {
    setFormData(addr.raw)
    setEditingId(addr.id)
    if (nameInputRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => nameInputRef.current.focus(), 300)
    }
  }

  const handleDelete = (id) => {
    addressService.deleteAddress(id)
      .then((res) => setSavedAddresses((res.data.addresses || []).map(mapAddr)))
      .catch((err) => showToast(err.message))
    if (editingId === id) resetForm()
  }

  const setAsPrimary = (id) => {
    setConfirmPrimaryId(id)
  }

  const confirmSetAsPrimary = () => {
    if (confirmPrimaryId !== null) {
      addressService.setDefaultAddress(confirmPrimaryId)
        .then((res) => setSavedAddresses((res.data.addresses || []).map(mapAddr)))
        .catch((err) => showToast(err.message))
      setConfirmPrimaryId(null)
    }
  }

  const handleSave = () => {
    if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.flatHouse.trim() || !formData.city.trim()) {
      showToast('Please fill in the required fields (Name, Mobile, Address, City).')
      return
    }

    const payload = {
      fullName: formData.fullName.trim(),
      mobile: formData.mobile.trim(),
      pincode: formData.pincode.trim(),
      addressLine: [formData.flatHouse.trim(), formData.areaStreet.trim()].filter(Boolean).join(', '),
      landmark: formData.landmark.trim(),
      city: formData.city.trim(),
      state: formData.state,
      addressType: formData.addressType,
      isDefault: formData.setAsDefault,
    }

    const request = editingId ? addressService.updateAddress(editingId, payload) : addressService.addAddress(payload)
    request
      .then((res) => {
        setSavedAddresses((res.data.addresses || []).map(mapAddr))
        showToast(editingId ? 'Address updated!' : 'Address added!')
        resetForm()
      })
      .catch((err) => showToast(err.message))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">Add / Edit Address</h1>
        <p className="text-gray-500 text-sm">Enter the address details below for smooth delivery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-6">
            {/* Contact Details */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} /> Contact Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name*</label>
                    <input ref={nameInputRef} type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mobile Number*</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pincode*</label>
                  <div className="flex gap-2">
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition" />
                    <button className="px-5 py-2.5 bg-purple-50 text-purple-600 font-bold text-sm rounded-xl hover:bg-purple-100 whitespace-nowrap transition">Check Pincode</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} /> Address Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Flat, House No., Building, Company, Apartment*</label>
                  <input type="text" name="flatHouse" value={formData.flatHouse} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Area, Street, Sector, Village*</label>
                  <input type="text" name="areaStreet" value={formData.areaStreet} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Landmark (Optional)</label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">City / Town*</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">State*</label>
                    <select name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition bg-white">
                      <option>Haryana</option>
                      <option>Delhi</option>
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Address Type</label>
              <div className="flex gap-3">
                <button onClick={() => setFormData(prev => ({ ...prev, addressType: 'home' }))} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition ${formData.addressType === 'home' ? 'border-purple-600 text-purple-600 bg-purple-50' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <Home size={16} /> Home
                </button>
                <button onClick={() => setFormData(prev => ({ ...prev, addressType: 'work' }))} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition ${formData.addressType === 'work' ? 'border-purple-600 text-purple-600 bg-purple-50' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <Briefcase size={16} /> Work
                </button>
                <button onClick={() => setFormData(prev => ({ ...prev, addressType: 'other' }))} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition ${formData.addressType === 'other' ? 'border-purple-600 text-purple-600 bg-purple-50' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <MoreHorizontal size={16} /> Other
                </button>
              </div>
            </div>

            {/* Set as Default */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Set as Default Address</p>
                <p className="text-xs text-gray-500 mt-0.5">This address will be used by default for all orders</p>
              </div>
              <button onClick={() => setFormData(prev => ({ ...prev, setAsDefault: !prev.setAsDefault }))} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${formData.setAsDefault ? 'bg-purple-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.setAsDefault ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <button onClick={resetForm} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition">{editingId ? 'Update Address' : 'Save Address'}</button>
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Saved Addresses</h2>
            <div className="space-y-4">
              {savedAddresses.map((addr) => (
                <div key={addr.id} className={`border rounded-2xl p-5 bg-white relative ${addr.type === 'PRIMARY' ? 'border-purple-300 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAsPrimary(addr.id)} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${addr.type === 'PRIMARY' ? 'border-purple-600' : 'border-gray-300 hover:border-purple-400'}`}>
                        {addr.type === 'PRIMARY' && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                      </button>
                      <h3 className="font-bold text-gray-900 text-sm">{addr.name}</h3>
                    </div>
                    <span className={`text-[9px] font-black tracking-wide px-2 py-1 rounded-md uppercase ${addr.type === 'PRIMARY' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {addr.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 whitespace-pre-line leading-relaxed">{addr.address}</p>
                  <p className="text-xs font-semibold text-gray-700 mb-3">{addr.phone}</p>
                  <div className="border-t border-gray-100 pt-3 flex gap-4">
                    <button onClick={() => handleEdit(addr)} className="text-purple-600 font-bold text-xs flex items-center gap-1 hover:underline">
                      <Edit size={13} /> Edit
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="text-red-500 font-bold text-xs flex items-center gap-1 hover:underline">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={resetForm} className="w-full border-2 border-dashed border-purple-200 bg-purple-50/50 rounded-2xl p-4 text-center text-purple-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition">
                <Plus size={16} /> Add New Address
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmPrimaryId !== null && (
        <Modal title="Change Primary Address?" onClose={() => setConfirmPrimaryId(null)}>
          <p className="text-gray-600 text-sm mb-6">Are you sure you want to set this as your primary default address?</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmPrimaryId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={confirmSetAsPrimary} className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition">Confirm</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function AccountPage() {
  const navigate = useNavigate()
  const { setIsChatOpen, showToast, wishlistCount } = useShop()
  const { isAuthenticated, isAuthLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      showToast('Please login to view your account')
      navigate('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    )
  }

  const handleRefer = async () => {
    const shareData = {
      title: 'Join Hashtelicom',
      text: 'Hey! Join me on Hashtelicom and get exclusive rewards on premium lingerie!',
      url: window.location.origin + '?ref=USER123'
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing', err)
      }
    } else {
      navigator.clipboard.writeText(shareData.url)
      showToast('Referral link copied to clipboard!')
    }
  }

  const panels = {
    profile:       <ProfilePanel />,
    orders:        <OrdersPanel />,
    wishlist:      <WishlistPanel />,
    addresses:     <AddressesPanel />,
    payments:      <PaymentsPanel />,
    interests:     <InterestsPanel />,
    recent:        <RecentPanel />,
    reviews:       <ReviewsPanel />,
    // privacy:       <PrivacyPanel />,
    notifications: <NotificationsPanel />,
    help:          <HelpPanel />,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-5 py-6 flex flex-col md:flex-row gap-5">

        {/* Mobile Sidebar Toggle Button */}
        <div className="md:hidden flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <User size={18} className="text-purple-600" /> My Account
          </h2>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center justify-center text-gray-700 bg-gray-100 hover:bg-purple-100 hover:text-purple-600 p-2 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* LEFT SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white shadow-2xl transform transition-transform duration-300 md:static md:w-[230px] md:bg-transparent md:shadow-none md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col gap-4 overflow-y-auto md:overflow-visible h-full md:h-auto`}>
          
          {/* Mobile Sidebar Header */}
          <div className="md:hidden flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-black text-lg text-gray-900">Account Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="bg-white rounded-none md:rounded-2xl shadow-none md:shadow-sm border-0 md:border border-gray-100 overflow-hidden py-2 md:py-3 flex-1 md:flex-none">
            <h3 className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest px-5 mb-1">My Account</h3>
            <nav className="flex flex-col">
              {MENU.map(({ id, label, icon: Icon, badge }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id)
                      setIsSidebarOpen(false)
                    }}
                    className={`w-full flex-shrink-0 flex items-center justify-between gap-3 px-5 py-3 md:py-2.5 text-sm font-semibold border-l-[3px] transition-all ${
                      active ? 'bg-purple-50 text-purple-600 border-purple-600' : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-purple-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 whitespace-nowrap"><Icon size={18} className={active ? "text-purple-600" : "text-gray-400"} /><span>{label}</span></div>
                    {badge && id === 'wishlist' && wishlistCount > 0 && <span className="bg-red-100 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">{wishlistCount}</span>}
                  </button>
                )
              })}
              <div className="h-px bg-gray-100 my-2 mx-5" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-red-500 border-l-[3px] border-transparent hover:bg-red-50 transition">
                <LogOut size={18} /> Logout
              </button>
            </nav>
          </div>

          {/* Refer & Earn */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white relative overflow-hidden shadow-sm hidden md:block">
            <Gift className="absolute right-0 bottom-0 text-white opacity-10 w-28 h-28 transform translate-x-6 translate-y-6" />
            <h4 className="font-black text-base mb-1 relative z-10">Refer &amp; Earn</h4>
            <p className="text-xs text-purple-100 mb-4 relative z-10 leading-relaxed">Invite your friends and earn exclusive rewards.</p>
            <button onClick={handleRefer} className="bg-white text-purple-600 text-xs font-black px-4 py-2 rounded-lg hover:bg-gray-50 transition relative z-10">Refer Now</button>
          </div>

          {/* Chat */}
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-3 px-5 font-bold md:flex items-center justify-center gap-2 text-sm shadow hover:shadow-md transition hidden"
          >
            <MessageCircle size={17} /> Chat with us
          </button>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* RIGHT CONTENT PANEL */}
        <main className="flex-1 min-w-0 flex flex-col">
          {panels[activeTab]}

          {/* Mobile bottom blocks */}
          <div className="flex flex-col gap-4 mt-8 md:hidden">
            {/* Refer & Earn */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white relative overflow-hidden shadow-sm">
              <Gift className="absolute right-0 bottom-0 text-white opacity-10 w-28 h-28 transform translate-x-6 translate-y-6" />
              <h4 className="font-black text-base mb-1 relative z-10">Refer &amp; Earn</h4>
              <p className="text-xs text-purple-100 mb-4 relative z-10 leading-relaxed">Invite your friends and earn exclusive rewards.</p>
              <button onClick={handleRefer} className="bg-white text-purple-600 text-xs font-black px-4 py-2 rounded-lg hover:bg-gray-50 transition relative z-10">Refer Now</button>
            </div>

            {/* Chat */}
            <button 
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-3 px-5 font-bold flex items-center justify-center gap-2 text-sm shadow hover:shadow-md transition"
            >
              <MessageCircle size={17} /> Chat with us
            </button>
          </div>
        </main>

      </div>

      <Footer />
    </div>
  )
}
