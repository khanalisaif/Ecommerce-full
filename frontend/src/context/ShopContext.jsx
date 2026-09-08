import { createContext, useContext, useEffect, useState } from 'react'
import { popularSearches as defaultPopularSearches, CATEGORY_CONFIG as defaultCategoryConfig } from '../data/dummyData'
import { DEFAULT_FOOTER_SETTINGS, DEFAULT_FOOTER_SHOP_LINKS, DEFAULT_FOOTER_CATEGORY_LINKS, DEFAULT_PAGES, DEFAULT_FAQS, slugifyTitle } from '../data/footerStore'
import {
  buildInitialBanners, buildInitialCollections, buildInitialCategoryCards,
  normalizeBanner, normalizeCollection, normalizeCategoryCard, DEFAULT_TRUST_BADGES,
  buildInitialFeatureBanners, normalizeFeatureBanner,
} from '../data/homepageStore'

import { useAuth } from './AuthContext'
import { useAdminAuth } from './AdminAuthContext'

import contentKVService from '../services/contentKVService'
import adminContentService from '../services/admin/adminContentService'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import adminProductService from '../services/admin/adminProductService'
import adminCategoryService from '../services/admin/adminCategoryService'
import adminOrderService from '../services/admin/adminOrderService'
import cartService from '../services/cartService'
import wishlistService from '../services/wishlistService'

const ShopContext = createContext(null)

export const DEFAULT_TOPBAR_SETTINGS = {
  announcementEnabled: false,
  announcementText: 'Free shipping on orders above ₹999',
  announcementBgType: 'gradient',
  announcementBgColor1: '#a855f7',
  announcementBgColor2: '#ec4899',
  announcementBgColor3: '#fca5a5',
}

// Default (fallback) image paths — these are the original files bundled in /public.
// Admin-uploaded images (Cloudinary URLs) override these once set on the backend.
export const DEFAULT_SITE_ASSETS = {
  logoUrl: '/logo.png',
  loginImageUrl: '/login.png',
  signupImageUrl: '/signin.png',
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// Build a stable line-item id for a GUEST cart line (product + variant).
// Logged-in carts use the backend's own cart-item _id as cartId instead.
function buildCartId(productId, color, size) {
  return [productId, color || 'default', size || 'default'].join('__')
}

// Maps any backend product document (storefront-shaped or raw admin doc) into
// the one flat shape every page/component already expects.
function mapBackendProduct(doc) {
  if (!doc) return null
  const images = doc.images && doc.images.length ? doc.images : doc.image ? [doc.image] : []
  const colors = doc.colors || []
  const firstColor = colors[0]
  return {
    id: String(doc._id || doc.id),
    name: doc.name,
    description: doc.description || '',
    brand: doc.brand,
    brand_name: doc.brandName || doc.brand_name || doc.brand,
    category: doc.categorySlug || doc.category,
    price: doc.price,
    originalPrice: doc.originalPrice ?? doc.price,
    discount: doc.discount || '',
    rating: doc.rating != null ? doc.rating : 4.5,
    reviews: doc.reviews != null ? doc.reviews : 0,
    image: images[0] || '',
    images,
    color: firstColor && typeof firstColor === 'object' ? firstColor.name || '' : firstColor || '',
    colors,
    sizes: doc.sizes || [],
    sizesStr: (doc.sizes || []).join(', '),
    stock: doc.stock != null ? doc.stock : 0,
    stockInfo: doc.stock > 0 ? 'In Stock' : 'Out of Stock',
    isAssured: doc.isAssured != null ? doc.isAssured : true,
    badge: doc.badge || '',
    isBestSeller: !!doc.isBestSeller,
    isNewArrival: !!doc.isNewArrival,
    sku: doc.sku || '',
  }
}

function mapCartItemFromApi(item) {
  const p = mapBackendProduct(item.product) || {}
  return {
    cartId: item._id,
    id: p.id,
    name: p.name,
    image: p.image,
    price: item.priceAtAdd,
    originalPrice: p.originalPrice ?? item.priceAtAdd,
    discount: p.discount,
    color: item.color || null,
    size: item.size || null,
    category: p.category,
    quantity: item.quantity,
  }
}

export function ShopProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const { isAdminAuthenticated } = useAdminAuth()

  const [cartItems, setCartItems] = useState(() => loadFromStorage('hashtelicom_cart', []))
  const [wishlistItems, setWishlistItems] = useState(() => loadFromStorage('hashtelicom_wishlist', []))
  const [toast, setToast] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)

  // ---------------- Real backend collections: products, categories, orders ----------------
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])

  // ---------------- Generic CMS content (persisted via /api/content key/value store) ----------------
  const [siteAssets, setSiteAssetsState] = useState(DEFAULT_SITE_ASSETS)
  const [topbarSettings, setTopbarSettingsState] = useState(DEFAULT_TOPBAR_SETTINGS)
  const [popularSearches, setPopularSearchesState] = useState(defaultPopularSearches)
  const [categoryConfigs, setCategoryConfigsState] = useState(defaultCategoryConfig)
  const [footerSettings, setFooterSettingsState] = useState(DEFAULT_FOOTER_SETTINGS)
  const [footerShopLinks, setFooterShopLinksState] = useState(DEFAULT_FOOTER_SHOP_LINKS)
  const [footerCategoryLinks, setFooterCategoryLinksState] = useState(DEFAULT_FOOTER_CATEGORY_LINKS)
  const [pages, setPagesState] = useState(DEFAULT_PAGES)
  const [faqs, setFaqsState] = useState(DEFAULT_FAQS)
  const [banners, setBannersState] = useState([])
  const [collections, setCollectionsState] = useState([])
  const [categoryCards, setCategoryCardsState] = useState([])
  const [featureBanners, setFeatureBannersState] = useState([])
  const [trustBadges, setTrustBadgesState] = useState(DEFAULT_TRUST_BADGES)

  // Persists a CMS key to the backend (admin only — silently skipped for
  // storefront visitors since they never call these mutation functions).
  const persistContent = (key, value) => {
    if (!isAdminAuthenticated) return
    adminContentService.setByKey(key, value).catch((err) => {
      console.error(`Failed to save ${key}:`, err.message)
      showToast(`Failed to save changes: ${err.message}`)
    })
  }

  // Wraps a useState setter so every update also persists to the backend —
  // lets every add/update/delete/reorder function below stay nearly
  // identical to the original localStorage-based implementation.
  const withPersist = (setState, key) => (updater) =>
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persistContent(key, next)
      return next
    })

  const setSiteAssets = withPersist(setSiteAssetsState, 'site_assets')
  const setTopbarSettings = withPersist(setTopbarSettingsState, 'topbar_settings')
  const setPopularSearches = withPersist(setPopularSearchesState, 'popular_searches')
  const setCategoryConfigs = withPersist(setCategoryConfigsState, 'category_configs')
  const setFooterSettings = withPersist(setFooterSettingsState, 'footer_settings')
  const setFooterShopLinks = withPersist(setFooterShopLinksState, 'footer_shop_links')
  const setFooterCategoryLinks = withPersist(setFooterCategoryLinksState, 'footer_category_links')
  const setPages = withPersist(setPagesState, 'pages')
  const setFaqs = withPersist(setFaqsState, 'faqs')
  const setBanners = withPersist(setBannersState, 'banners')
  const setCollections = withPersist(setCollectionsState, 'collections')
  const setCategoryCards = withPersist(setCategoryCardsState, 'category_cards')
  const setFeatureBanners = withPersist(setFeatureBannersState, 'feature_banners')
  const setTrustBadges = withPersist(setTrustBadgesState, 'trust_badges')

  // ---------------- Initial load: public CMS content (works for guests + admin alike) ----------------
  useEffect(() => {
    contentKVService
      .getAll()
      .then((res) => {
        const c = res.data.content || {}
        if (c.site_assets) setSiteAssetsState(c.site_assets)
        if (c.topbar_settings) setTopbarSettingsState(c.topbar_settings)
        if (c.popular_searches?.length) setPopularSearchesState(c.popular_searches)
        if (c.category_configs && Object.keys(c.category_configs).length) setCategoryConfigsState(c.category_configs)
        if (c.footer_settings) setFooterSettingsState(c.footer_settings)
        if (c.footer_shop_links?.length) setFooterShopLinksState(c.footer_shop_links)
        if (c.footer_category_links?.length) setFooterCategoryLinksState(c.footer_category_links)
        if (c.pages?.length) setPagesState(c.pages)
        if (c.faqs?.length) setFaqsState(c.faqs)
        setBannersState(c.banners?.length ? c.banners : buildInitialBanners())
        setCollectionsState(c.collections?.length ? c.collections : buildInitialCollections())
        setCategoryCardsState(c.category_cards?.length ? c.category_cards : buildInitialCategoryCards())
        setFeatureBannersState(c.feature_banners?.length ? c.feature_banners : buildInitialFeatureBanners())
        if (c.trust_badges?.length) setTrustBadgesState(c.trust_badges)
      })
      .catch((err) => console.error('Failed to load site content:', err.message))
  }, [])

  // ---------------- Initial + admin-aware load: products & categories ----------------
  const refreshProducts = () => {
    const request = isAdminAuthenticated
      ? adminProductService.getAllProducts({ limit: 1000 })
      : productService.getProducts({ limit: 1000 })
    request
      .then((res) => setProducts((res.data.products || []).map(mapBackendProduct)))
      .catch((err) => console.error('Failed to load products:', err.message))
  }

  const refreshCategories = () => {
    const request = isAdminAuthenticated ? adminCategoryService.getAllCategories() : categoryService.getCategories()
    request
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error('Failed to load categories:', err.message))
  }

  useEffect(() => {
    refreshProducts()
    refreshCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminAuthenticated])

  // ---------------- Admin: all orders (for the Orders / Overview tabs) ----------------
  const mapAdminOrder = (o) => {
    const firstItem = o.items?.[0] || {}
    const addr = o.shippingAddress
    const formattedAddress = addr
      ? [addr.addressLine, addr.landmark, `${addr.city}, ${addr.state} ${addr.pincode}`].filter(Boolean).join(', ')
      : ''
    return {
      id: o.orderId || String(o._id),
      _id: o._id,
      customerName: o.user?.fullName || o.shippingAddress?.fullName || 'Guest',
      customerEmail: o.user?.email || '',
      product: firstItem.name ? (o.items.length > 1 ? `${firstItem.name} +${o.items.length - 1} more` : firstItem.name) : '—',
      image: firstItem.image || '',
      amount: o.total ?? 0,
      status: o.status,
      date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      statusHistory: o.statusHistory || [],
      items: o.items || [],
      shippingAddress: o.shippingAddress,
      address: formattedAddress,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
    }
  }

  useEffect(() => {
    if (!isAdminAuthenticated) return
    adminOrderService
      .getAllOrders({ limit: 500 })
      .then((res) => setOrders((res.data.orders || []).map(mapAdminOrder)))
      .catch((err) => console.error('Failed to load orders:', err.message))
  }, [isAdminAuthenticated])

  const updateOrderStatus = (orderId, newStatus) => {
    let mongoId = null
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o
        mongoId = o._id
        if (o.status === newStatus) return o
        return { ...o, status: newStatus, statusHistory: [...(o.statusHistory || []), { status: newStatus, timestamp: new Date().toISOString() }] }
      })
    )
    if (mongoId) {
      adminOrderService.updateOrderStatus(mongoId, newStatus).catch((err) => showToast(err.message))
    }
  }

  const updatePaymentStatus = (orderId, newPaymentStatus) => {
    let mongoId = null
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o
        mongoId = o._id
        return { ...o, paymentStatus: newPaymentStatus }
      })
    )
    if (mongoId) {
      adminOrderService.updatePaymentStatus(mongoId, newPaymentStatus).catch((err) => showToast(err.message))
    }
  }

  const deleteOrder = async (orderId) => {
    let mongoId = null
    const target = orders.find((o) => o.id === orderId || o._id === orderId)
    if (target) mongoId = target._id || target.id
    else mongoId = orderId

    setOrders((prev) => prev.filter((o) => o.id !== orderId && o._id !== orderId))
    if (mongoId) {
      try {
        await adminOrderService.deleteOrder(mongoId)
        showToast('Order deleted successfully')
      } catch (err) {
        showToast(err.message, 'error')
        adminOrderService
          .getAllOrders({ limit: 500 })
          .then((res) => setOrders((res.data.orders || []).map(mapAdminOrder)))
          .catch(() => {})
      }
    }
  }

  const getOrderById = (orderId) => orders.find((o) => o.id === orderId)

  function reorderList(setter, id, direction) {
    setter((prev) => {
      const idx = prev.findIndex((x) => x.id === id)
      const swapWith = direction === 'up' ? idx - 1 : idx + 1
      if (idx < 0 || swapWith < 0 || swapWith >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      return next
    })
  }

  // ---------------- Homepage: Hero Banners ----------------
  const addBanner = (data) => setBanners((prev) => [...prev, normalizeBanner({ ...data, id: `banner-${Date.now()}` })])
  const updateBanner = (id, updates) => setBanners((prev) => prev.map((b) => (b.id === id ? normalizeBanner({ ...b, ...updates, id }) : b)))
  const deleteBanner = (id) => setBanners((prev) => prev.filter((b) => b.id !== id))
  const reorderBanner = (id, direction) => reorderList(setBanners, id, direction)

  // ---------------- Homepage: Collections grid ----------------
  const addCollection = (data) => setCollections((prev) => [...prev, normalizeCollection({ ...data, id: `col-${Date.now()}` })])
  const updateCollection = (id, updates) => setCollections((prev) => prev.map((c) => (c.id === id ? normalizeCollection({ ...c, ...updates, id }) : c)))
  const deleteCollection = (id) => setCollections((prev) => prev.filter((c) => c.id !== id))
  const reorderCollection = (id, direction) => reorderList(setCollections, id, direction)

  // ---------------- Homepage: Category cards ----------------
  const addCategoryCard = (data) => setCategoryCards((prev) => [...prev, normalizeCategoryCard({ ...data, id: `card-${Date.now()}` })])
  const updateCategoryCard = (id, updates) => setCategoryCards((prev) => prev.map((c) => (c.id === id ? normalizeCategoryCard({ ...c, ...updates, id }) : c)))
  const deleteCategoryCard = (id) => setCategoryCards((prev) => prev.filter((c) => c.id !== id))
  const reorderCategoryCard = (id, direction) => reorderList(setCategoryCards, id, direction)

  // ---------------- Homepage: Feature banner (full-width promo strip) ----------------
  const addFeatureBanner = (data) => setFeatureBanners((prev) => [...prev, normalizeFeatureBanner({ ...data, id: `fb-${Date.now()}` })])
  const updateFeatureBanner = (id, updates) => setFeatureBanners((prev) => prev.map((b) => (b.id === id ? normalizeFeatureBanner({ ...b, ...updates, id }) : b)))
  const deleteFeatureBanner = (id) => setFeatureBanners((prev) => prev.filter((b) => b.id !== id))
  const reorderFeatureBanner = (id, direction) => reorderList(setFeatureBanners, id, direction)

  // ---------------- Footer trust badges ----------------
  const addTrustBadge = (data) => setTrustBadges((prev) => [...prev, { id: `tb-${Date.now()}`, icon: data.icon || 'ShieldCheck', title: data.title.trim(), desc: data.desc.trim() }])
  const updateTrustBadge = (id, updates) => setTrustBadges((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  const deleteTrustBadge = (id) => setTrustBadges((prev) => prev.filter((b) => b.id !== id))
  const reorderTrustBadge = (id, direction) => reorderList(setTrustBadges, id, direction)

  // ---------------- Footer settings (brand text, social links, copyright) ----------------
  const updateFooterSettings = (updates) => {
    setFooterSettings((prev) => ({
      ...prev,
      ...updates,
      social: updates.social ? { ...prev.social, ...updates.social } : prev.social,
    }))
  }

  // ---------------- Footer "Shop" links ----------------
  const addFooterShopLink = (data) => setFooterShopLinks((prev) => [...prev, { id: `fs-${Date.now()}`, label: data.label.trim(), slug: data.slug }])
  const updateFooterShopLink = (id, updates) => setFooterShopLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)))
  const deleteFooterShopLink = (id) => setFooterShopLinks((prev) => prev.filter((l) => l.id !== id))
  const reorderFooterShopLink = (id, direction) => reorderList(setFooterShopLinks, id, direction)

  // ---------------- Footer "Categories" links ----------------
  const addFooterCategoryLink = (data) => setFooterCategoryLinks((prev) => [...prev, { id: `fc-${Date.now()}`, label: data.label.trim(), slug: data.slug }])
  const updateFooterCategoryLink = (id, updates) => setFooterCategoryLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)))
  const deleteFooterCategoryLink = (id) => setFooterCategoryLinks((prev) => prev.filter((l) => l.id !== id))
  const reorderFooterCategoryLink = (id, direction) => reorderList(setFooterCategoryLinks, id, direction)

  // ---------------- Info pages (Terms, Privacy, Shipping, Returns, Contact, etc.) ----------------
  const addPage = (data) => {
    const newPage = { id: `page-${Date.now()}`, title: data.title.trim(), slug: slugifyTitle(data.title), content: data.content || '' }
    setPages((prev) => [...prev, newPage])
    return newPage
  }
  const updatePage = (id, updates) =>
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, slug: updates.title ? slugifyTitle(updates.title) : p.slug } : p)))
  const deletePage = (id) => setPages((prev) => prev.filter((p) => p.id !== id))
  const getPageBySlug = (slug) => pages.find((p) => p.slug === slug)

  // ---------------- FAQs ----------------
  const addFaq = (data) => setFaqs((prev) => [...prev, { id: `faq-${Date.now()}`, question: data.question.trim(), answer: data.answer.trim() }])
  const updateFaq = (id, updates) => setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  const deleteFaq = (id) => setFaqs((prev) => prev.filter((f) => f.id !== id))
  const reorderFaq = (id, direction) => reorderList(setFaqs, id, direction)

  // ---------------- Top Bar (announcement strip + search suggestions) ----------------
  const updateTopbarSettings = (updates) => setTopbarSettings((prev) => ({ ...prev, ...updates }))
  const addPopularSearch = (term) => {
    const t = term.trim()
    if (!t) return
    setPopularSearches((prev) => (prev.includes(t) ? prev : [...prev, t]))
  }
  const removePopularSearch = (term) => setPopularSearches((prev) => prev.filter((t) => t !== term))

  // ---------------- Categories (backend-managed) ----------------
  const addCategory = (data) => {
    return adminCategoryService
      .createCategory({ name: data.name, icon: data.icon || 'Package', image: data.image || '' })
      .then((res) => {
        setCategories((prev) => [...prev, res.data.category])
        return res.data.category
      })
      .catch((err) => { showToast(err.message); throw err })
  }

  const updateCategory = (id, updates) => {
    return adminCategoryService
      .updateCategory(id, updates)
      .then((res) => {
        setCategories((prev) => prev.map((c) => (c.id === id ? res.data.category : c)))
        return res.data.category
      })
      .catch((err) => { showToast(err.message); throw err })
  }

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    return adminCategoryService.deleteCategory(id).catch((err) => { showToast(err.message); throw err })
  }

  const reorderCategory = (id, direction) => reorderList(setCategories, id, direction)

  const updateCategoryConfig = (slug, updates) => {
    setCategoryConfigs((prev) => ({ ...prev, [slug]: { ...prev[slug], ...updates } }))
  }

  // ---------------- Products (backend-managed catalog) ----------------
  const addProduct = (data) => {
    return adminProductService
      .createProduct(data)
      .then((res) => {
        const product = mapBackendProduct(res.data.product)
        setProducts((prev) => [product, ...prev])
        return product
      })
      .catch((err) => { showToast(err.message); throw err })
  }

  const updateProduct = (id, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === String(id) ? { ...p, ...updates } : p))) // optimistic
    return adminProductService
      .updateProduct(id, updates)
      .then((res) => {
        const product = mapBackendProduct(res.data.product)
        setProducts((prev) => prev.map((p) => (p.id === String(id) ? product : p)))
        return product
      })
      .catch((err) => { showToast(err.message); throw err })
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== String(id)))
    return adminProductService.deleteProduct(id).catch((err) => { showToast(err.message); throw err })
  }

  const getProductById = (id) => products.find((p) => p.id === String(id))

  // ---------------- Site Assets (admin-uploaded branding images) ----------------
  const setSiteAsset = (key, dataUrl) => setSiteAssets((prev) => ({ ...prev, [key]: dataUrl || DEFAULT_SITE_ASSETS[key] }))
  const resetSiteAsset = (key) => setSiteAssets((prev) => ({ ...prev, [key]: DEFAULT_SITE_ASSETS[key] }))

  const showToast = (message, type = 'success') => {
    setToast(typeof message === 'object' && message?.message ? message : { message, type })
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => setToast(null), 3000)
  }

  // ---------------- Cart ----------------
  // Logged-in users: every mutation calls the backend and the returned cart
  // becomes the new source of truth. Guests: same localStorage-backed
  // behavior the site always had (persisted via the effect below).
  useEffect(() => {
    localStorage.setItem('hashtelicom_cart', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem('hashtelicom_wishlist', JSON.stringify(wishlistItems))
  }, [wishlistItems])

  useEffect(() => {
    if (!isAuthenticated) return

    // Sync any guest cart items to backend when logging in
    const syncAndLoadUserData = async () => {
      try {
        const guestItems = cartItems.filter((i) => i.cartId && String(i.cartId).includes('__'))
        if (guestItems.length > 0) {
          for (const item of guestItems) {
            await cartService.addToCart({
              productId: item.id,
              quantity: item.quantity,
              size: item.size || '',
              color: item.color || '',
            }).catch(() => {})
          }
        }
        const cartRes = await cartService.getCart()
        setCartItems((cartRes.data.cart.items || []).map(mapCartItemFromApi))
      } catch {
        // Keep existing cart on error
      }

      try {
        const wishlistRes = await wishlistService.getWishlist()
        const mapped = (wishlistRes.data.wishlist || []).map(mapBackendProduct).map((p) => ({
          id: p.id, name: p.name, image: p.image, price: p.price, originalPrice: p.originalPrice,
          discount: p.discount, category: p.category, brand: p.brand_name || p.category || '',
          size: p.sizes?.[0] || 'One Size', color: p.color || '',
        }))
        setWishlistItems(mapped)
      } catch {
        // Keep existing wishlist on error
      }
    }

    syncAndLoadUserData()
  }, [isAuthenticated])

  const addToCart = (product, options = {}) => {
    const { quantity = 1, color, size } = options

    // 🔒 Login required to add to cart
    if (!isAuthenticated) {
      showToast('Please login to add items to your cart', 'error')
      setTimeout(() => { window.location.href = '/login' }, 800)
      return Promise.resolve()
    }

    const promise = cartService
      .addToCart({ productId: product.id, quantity, size: size || '', color: color || '' })
      .then((res) => {
        const items = (res.data.cart.items || []).map(mapCartItemFromApi)
        setCartItems(items)
        return items
      })
      .catch((err) => {
        showToast(err.message)
        throw err
      })
    showToast(`${product.name} added to cart`)
    return promise
  }

  const removeFromCart = (cartId) => {
    if (isAuthenticated) {
      cartService.removeCartItem(cartId).then((res) => setCartItems((res.data.cart.items || []).map(mapCartItemFromApi))).catch((err) => showToast(err.message))
      return
    }
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId))
  }

  const updateQuantity = (cartId, delta) => {
    if (isAuthenticated) {
      const item = cartItems.find((i) => i.cartId === cartId)
      if (!item) return
      cartService
        .updateCartItem(cartId, Math.max(1, item.quantity + delta))
        .then((res) => setCartItems((res.data.cart.items || []).map(mapCartItemFromApi)))
        .catch((err) => showToast(err.message))
      return
    }
    setCartItems((prev) => prev.map((item) => (item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)))
  }

  const setQuantity = (cartId, quantity) => {
    if (isAuthenticated) {
      cartService
        .updateCartItem(cartId, Math.max(1, quantity))
        .then((res) => setCartItems((res.data.cart.items || []).map(mapCartItemFromApi)))
        .catch((err) => showToast(err.message))
      return
    }
    setCartItems((prev) => prev.map((item) => (item.cartId === cartId ? { ...item, quantity: Math.max(1, quantity) } : item)))
  }

  const clearCart = () => {
    if (isAuthenticated) {
      cartService.clearCart().then(() => setCartItems([])).catch((err) => showToast(err.message))
      return
    }
    setCartItems([])
  }

  const isInCart = (productId) => cartItems.some((item) => item.id === productId)

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const cartOriginalTotal = cartItems.reduce((acc, item) => acc + (item.originalPrice ?? item.price) * item.quantity, 0)
  const cartDiscount = Math.max(0, cartOriginalTotal - cartSubtotal)

  // ---------------- Wishlist ----------------
  const isWishlisted = (productId) => wishlistItems.some((item) => item.id === productId)

  const addToWishlist = (product) => {
    // 🔒 Login required to add to wishlist
    if (!isAuthenticated) {
      showToast('Please login to add items to your wishlist', 'error')
      setTimeout(() => { window.location.href = '/login' }, 800)
      return
    }
    wishlistService.addToWishlist(product.id).catch((err) => showToast(err.message))
    setWishlistItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev
      return [...prev, {
        id: product.id, name: product.name, image: product.image, price: product.price,
        originalPrice: product.originalPrice ?? product.price, discount: product.discount,
        category: product.category, brand: product.brand || product.category || '',
        size: product.size || (product.sizes ? product.sizes[0] : 'One Size'), color: product.color || (product.colors ? product.colors[0] : ''),
      }]
    })
    showToast(`${product.name} added to wishlist`)
  }

  const removeFromWishlist = (productId) => {
    if (isAuthenticated) {
      wishlistService.removeFromWishlist(productId).catch((err) => showToast(err.message))
    }
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const toggleWishlist = (product) => {
    // 🔒 Login required to toggle wishlist
    if (!isAuthenticated) {
      showToast('Please login to save items to your wishlist', 'error')
      setTimeout(() => { window.location.href = '/login' }, 800)
      return
    }
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id)
      showToast(`${product.name} removed from wishlist`)
    } else {
      addToWishlist(product)
    }
  }

  const moveWishlistItemToCart = (item) => {
    addToCart(item, { quantity: 1, color: item.color, size: item.size })
    removeFromWishlist(item.id)
  }

  const moveAllWishlistToCart = () => {
    wishlistItems.forEach((item) => addToCart(item, { quantity: 1, color: item.color, size: item.size }))
    setWishlistItems([])
    showToast('All items moved to cart!')
  }

  const wishlistCount = wishlistItems.length

  const value = {
    cartItems, addToCart, removeFromCart, updateQuantity, setQuantity, clearCart, isInCart,
    cartCount, cartSubtotal, cartOriginalTotal, cartDiscount,

    wishlistItems, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist,
    moveWishlistItemToCart, moveAllWishlistToCart, wishlistCount,

    toast, showToast, isChatOpen, setIsChatOpen,

    siteAssets, setSiteAsset, resetSiteAsset,

    products, addProduct, updateProduct, deleteProduct, getProductById, refreshProducts,

    categories, addCategory, updateCategory, deleteCategory, reorderCategory, refreshCategories,

    categoryConfigs, updateCategoryConfig,

    topbarSettings, updateTopbarSettings, popularSearches, addPopularSearch, removePopularSearch,

    footerSettings, updateFooterSettings,
    footerShopLinks, addFooterShopLink, updateFooterShopLink, deleteFooterShopLink, reorderFooterShopLink,
    footerCategoryLinks, addFooterCategoryLink, updateFooterCategoryLink, deleteFooterCategoryLink, reorderFooterCategoryLink,

    pages, addPage, updatePage, deletePage, getPageBySlug,

    faqs, addFaq, updateFaq, deleteFaq, reorderFaq,

    banners, addBanner, updateBanner, deleteBanner, reorderBanner,

    collections, addCollection, updateCollection, deleteCollection, reorderCollection,

    categoryCards, addCategoryCard, updateCategoryCard, deleteCategoryCard, reorderCategoryCard,

    featureBanners, addFeatureBanner, updateFeatureBanner, deleteFeatureBanner, reorderFeatureBanner,

    trustBadges, addTrustBadge, updateTrustBadge, deleteTrustBadge, reorderTrustBadge,

    orders, updateOrderStatus, updatePaymentStatus, deleteOrder, getOrderById,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within a ShopProvider')
  return ctx
}
