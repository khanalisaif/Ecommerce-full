import { CATEGORY_PRODUCTS, bestSellers } from './dummyData'
import { normalizeColorList, getColorName } from './colorUtils'

// Known category slugs a product can belong to (drives which /category/:slug
// page a product shows up on, and the nav/collections already point to these).
export const PRODUCT_CATEGORIES = Object.keys(CATEGORY_PRODUCTS)

function computeDiscount(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return ''
  return `${Math.round((1 - price / originalPrice) * 100)}% OFF`
}

function computeStockInfo(stock) {
  return stock === 0 ? 'Out of Stock' : 'In Stock'
}

// Normalizes any raw product object (from the old static dummy data, or a
// fresh admin submission) into one consistent shape every page can rely on.
export function normalizeProduct(raw, { isBestSeller = false } = {}) {
  const colors = normalizeColorList(
    Array.isArray(raw.colors) ? raw.colors : raw.color ? [raw.color] : ['Black']
  )

  const sizesArr = Array.isArray(raw.sizes)
    ? raw.sizes
    : typeof raw.sizes === 'string'
    ? raw.sizes.split(',').map((s) => s.trim()).filter(Boolean)
    : ['One Size']

  const price = Number(raw.price) || 0
  const originalPrice = Number(raw.originalPrice) || price
  const stock = raw.stock != null ? Number(raw.stock) : 50

  const brandName = raw.brand_name || raw.brand || 'Generic'

  return {
    id: String(raw.id),
    name: raw.name || 'Unnamed Product',
    description: raw.description || '',
    brand: (raw.brand || brandName).toUpperCase(),
    brand_name: brandName,
    category: raw.category || 'For-You',
    price,
    originalPrice,
    discount: raw.discount || computeDiscount(price, originalPrice),
    rating: raw.rating != null ? Number(raw.rating) : 4.5,
    reviews: raw.reviews != null ? Number(raw.reviews) : Math.floor(Math.random() * 500) + 20,
    image: raw.image || raw.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    images: raw.images && raw.images.length ? raw.images : [raw.image].filter(Boolean),
    color: getColorName(colors[0]),
    colors,
    sizes: sizesArr,
    sizesStr: sizesArr.join(', '),
    stock,
    stockInfo: computeStockInfo(stock),
    isAssured: raw.isAssured != null ? raw.isAssured : true,
    badge: raw.badge || '',
    isBestSeller: raw.isBestSeller != null ? raw.isBestSeller : isBestSeller,
    sku: raw.sku || `HTL-${String(raw.id).slice(-6).toUpperCase()}`,
  }
}

// Builds the initial product catalog by merging every product already
// hardcoded across the site (CATEGORY_PRODUCTS + bestSellers) into one
// deduplicated, normalized list. This becomes the seed for the admin-editable
// product store on first run.
export function buildInitialCatalog() {
  const bestSellerIds = new Set(bestSellers.map((p) => String(p.id)))
  const catalogProducts = Object.values(CATEGORY_PRODUCTS).flat()

  const seen = new Set()
  const merged = []

  for (const p of bestSellers) {
    if (seen.has(String(p.id))) continue
    seen.add(String(p.id))
    merged.push(normalizeProduct(p, { isBestSeller: true }))
  }
  for (const p of catalogProducts) {
    if (seen.has(String(p.id))) continue
    seen.add(String(p.id))
    merged.push(normalizeProduct(p, { isBestSeller: bestSellerIds.has(String(p.id)) }))
  }

  return merged
}
