import { banners as defaultBanners, collections as defaultCollections, categoryCards as defaultCategoryCards } from './dummyData'

export function normalizeBanner(raw) {
  return {
    id: raw.id || `banner-${Date.now()}`,
    title: raw.title || '',
    subtitle: raw.subtitle || '',
    description: raw.description || '',
    image: raw.image || '',
    buttonText: raw.buttonText || 'Shop Now',
  }
}

export function normalizeCollection(raw) {
  return {
    id: raw.id || `col-${Date.now()}`,
    name: raw.name || '',
    subtitle: raw.subtitle || '',
    image: raw.image || '',
    slug: raw.slug || '',
  }
}

export function normalizeCategoryCard(raw) {
  return {
    id: raw.id || `card-${Date.now()}`,
    name: raw.name || '',
    subtitle: raw.subtitle || '',
    image: raw.image || '',
    slug: raw.slug || '',
    subcategory: raw.subcategory || '',
    subcategorySlug: raw.subcategorySlug || '',
    styles: raw.styles || '',
    sizes: raw.sizes || '',
    cta: raw.cta || 'Shop Now',
  }
}

export function normalizeFeatureBanner(raw) {
  return {
    id: raw.id || `fb-${Date.now()}`,
    title: raw.title || '',
    subtitle: raw.subtitle || '',
    buttonText: raw.buttonText || 'Shop Now',
    badge1: raw.badge1 || '',
    badge2: raw.badge2 || '',
    image: raw.image || '',
    slug: raw.slug || '',
  }
}

export function normalizeHeroProductBanner(raw) {
  if (!raw) return null
  return {
    productId: raw.productId || raw.id || '',
    name: raw.name || '',
    subtitle: raw.subtitle || '',
    description: raw.description || '',
    price: raw.price || 0,
    originalPrice: raw.originalPrice || 0,
    discount: raw.discount || '',
    rating: raw.rating != null ? raw.rating : 4.5,
    reviews: raw.reviews != null ? raw.reviews : 0,
    image: raw.image || '',
    category: raw.category || '',
    brand: raw.brand || '',
    badge: raw.badge || '',
  }
}

export const DEFAULT_HERO2_SETTINGS = {
  enabled: true,
  showOldHero: false,
  showCategoryStrip: false,
  showBestSellers: false,
  showCollections: false,
  showSubCategoryCards: false,
  showHeroProductBanner: false,
  showFeatureBanner: false,
  tagline: '',
  title: '',
  titleHighlight: '',
  description: '',
  badges: [],
  buttonText: 'SHOP NOW',
  buttonLink: '/category/Best-Sellers',
  image: '',
  bgColor: '#fce4ec',
  bgGradientEnd: '#fed7e2',
  tickerBgColor: '#d81b60',
  tickerItems: [],
  circlesEnabled: true,
  circles: [],
  galleryEnabled: true,
  galleryTitle: '',
  galleryTitleHighlight: '',
  galleryBgColor: '#fce4ec',
  galleryBgGradientEnd: '#fed7e2',
  galleryCards: [],
  spotlightCarouselEnabled: true,
  spotlightCarousel: [],
}

export function normalizeHero2Settings(raw) {
  if (!raw) return DEFAULT_HERO2_SETTINGS
  return {
    enabled: raw.enabled !== undefined ? Boolean(raw.enabled) : DEFAULT_HERO2_SETTINGS.enabled,
    showOldHero: Boolean(raw.showOldHero),
    showCategoryStrip: Boolean(raw.showCategoryStrip),
    showBestSellers: Boolean(raw.showBestSellers),
    showCollections: raw.showCollections !== undefined ? Boolean(raw.showCollections) : true,
    showSubCategoryCards: raw.showSubCategoryCards !== undefined ? Boolean(raw.showSubCategoryCards) : true,
    showHeroProductBanner: raw.showHeroProductBanner !== undefined ? Boolean(raw.showHeroProductBanner) : true,
    showFeatureBanner: raw.showFeatureBanner !== undefined ? Boolean(raw.showFeatureBanner) : true,
    tagline: raw.tagline !== undefined ? raw.tagline : DEFAULT_HERO2_SETTINGS.tagline,
    title: raw.title !== undefined ? raw.title : DEFAULT_HERO2_SETTINGS.title,
    titleHighlight: raw.titleHighlight !== undefined ? raw.titleHighlight : DEFAULT_HERO2_SETTINGS.titleHighlight,
    description: raw.description !== undefined ? raw.description : DEFAULT_HERO2_SETTINGS.description,
    badges: Array.isArray(raw.badges) ? raw.badges : (typeof raw.badges === 'string' ? raw.badges.split(',').map(s=>s.trim()).filter(Boolean) : DEFAULT_HERO2_SETTINGS.badges),
    buttonText: raw.buttonText || DEFAULT_HERO2_SETTINGS.buttonText,
    buttonLink: raw.buttonLink || DEFAULT_HERO2_SETTINGS.buttonLink,
    image: raw.image || DEFAULT_HERO2_SETTINGS.image,
    bgColor: raw.bgColor || DEFAULT_HERO2_SETTINGS.bgColor,
    bgGradientEnd: raw.bgGradientEnd || DEFAULT_HERO2_SETTINGS.bgGradientEnd,
    tickerBgColor: raw.tickerBgColor || DEFAULT_HERO2_SETTINGS.tickerBgColor,
    tickerItems: Array.isArray(raw.tickerItems) && raw.tickerItems.length
      ? raw.tickerItems.map((t, idx) => ({
          id: t.id || `t-${idx}`,
          text: t.text || '',
          icon: t.icon || 'Leaf',
          image: t.image || '',
        }))
      : DEFAULT_HERO2_SETTINGS.tickerItems,
    circlesEnabled: raw.circlesEnabled !== undefined ? Boolean(raw.circlesEnabled) : DEFAULT_HERO2_SETTINGS.circlesEnabled,
    circles: Array.isArray(raw.circles) && raw.circles.length ? raw.circles : DEFAULT_HERO2_SETTINGS.circles,
    galleryEnabled: raw.galleryEnabled !== undefined ? Boolean(raw.galleryEnabled) : DEFAULT_HERO2_SETTINGS.galleryEnabled,
    galleryTitle: raw.galleryTitle !== undefined ? raw.galleryTitle : DEFAULT_HERO2_SETTINGS.galleryTitle,
    galleryTitleHighlight: raw.galleryTitleHighlight !== undefined ? raw.galleryTitleHighlight : DEFAULT_HERO2_SETTINGS.galleryTitleHighlight,
    galleryBgColor: raw.galleryBgColor || DEFAULT_HERO2_SETTINGS.galleryBgColor,
    galleryBgGradientEnd: raw.galleryBgGradientEnd || DEFAULT_HERO2_SETTINGS.galleryBgGradientEnd,
    galleryCards: Array.isArray(raw.galleryCards) && raw.galleryCards.length ? raw.galleryCards : DEFAULT_HERO2_SETTINGS.galleryCards,
    spotlightCarouselEnabled: raw.spotlightCarouselEnabled !== undefined ? Boolean(raw.spotlightCarouselEnabled) : DEFAULT_HERO2_SETTINGS.spotlightCarouselEnabled,
    spotlightCarousel: Array.isArray(raw.spotlightCarousel) && raw.spotlightCarousel.length ? raw.spotlightCarousel : DEFAULT_HERO2_SETTINGS.spotlightCarousel,
  }
}

export function buildInitialBanners() {
  return []
}

export function buildInitialCollections() {
  return []
}

export function buildInitialCategoryCards() {
  return []
}

export function buildInitialFeatureBanners() {
  return []
}

// Trust badges shown in the features strip above the footer.
export const TRUST_BADGE_ICON_OPTIONS = ['ShieldCheck', 'Truck', 'Headphones', 'Lock', 'RotateCcw', 'Box', 'Gift', 'Sparkles']

export const DEFAULT_TRUST_BADGES = [
  { id: 'tb-1', icon: 'ShieldCheck', title: '100% Discreet', desc: 'Private packaging. Zero product information' },
  { id: 'tb-2', icon: 'ShieldCheck', title: 'Secure Payments', desc: '100% safe, encrypted and trusted' },
  { id: 'tb-3', icon: 'Truck', title: 'Fast & Free Delivery', desc: 'Free shipping on orders ₹1499 and above' },
  { id: 'tb-4', icon: 'Headphones', title: '24/7 Customer Support', desc: 'We are here for you, always' },
]
