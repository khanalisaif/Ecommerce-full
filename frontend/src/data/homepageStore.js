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
  tagline: 'PURNA GUMMIES · ONE A DAY',
  title: 'Your Daily',
  titleHighlight: 'Dose of Goodness',
  description: 'Tasty, vegan gummies for beauty, immunity, sleep and everyday wellness. Just one a day.',
  badges: ['100% Vegan', 'Gelatin-Free', 'One a Day'],
  buttonText: 'SHOP NOW',
  buttonLink: '/category/Best-Sellers',
  image: '',
  bgColor: '#fce4ec',
  bgGradientEnd: '#fed7e2',
  tickerBgColor: '#d81b60',
  tickerItems: [
    { id: 't1', text: 'Halal Certified', icon: 'Halal' },
    { id: 't2', text: 'ISO Certified', icon: 'ISO' },
    { id: 't3', text: 'FSSAI Approved', icon: 'FSSAI' },
    { id: 't4', text: 'Gelatin-Free', icon: 'Leaf' },
    { id: 't5', text: 'Keto Friendly', icon: 'Keto' },
    { id: 't6', text: 'GMP Certified', icon: 'GMP' },
  ],
  circlesEnabled: true,
  circles: [
    { id: 'c1', name: 'Pretty Woman', image: '', link: '/category/Best-Sellers', bg: '#fce4ec' },
    { id: 'c2', name: 'Sweet Dreamzzz', image: '', link: '/category/Best-Sellers', bg: '#ede7f6' },
    { id: 'c3', name: 'Bright as Day', image: '', link: '/category/Best-Sellers', bg: '#fff3e0' },
    { id: 'c4', name: 'A Thing of Beauty', image: '', link: '/category/Best-Sellers', bg: '#fffde7' },
    { id: 'c5', name: 'Excalibur', image: '', link: '/category/Best-Sellers', bg: '#e8eaf6' },
    { id: 'c6', name: 'Mama Bear', image: '', link: '/category/Best-Sellers', bg: '#fce4ec' },
    { id: 'c7', name: 'Youthful You', image: '', link: '/category/Best-Sellers', bg: '#fff3e0' },
    { id: 'c8', name: 'Wonderful Tonight', image: '', link: '/category/Best-Sellers', bg: '#ffebee' },
  ],
  galleryEnabled: true,
  galleryTitle: 'EVERYDAY WELLNESS.',
  galleryTitleHighlight: 'SIMPLY PURNA.',
  galleryCards: [
    { id: 'g1', title: 'Youthful You', image: '', link: '/category/Best-Sellers' },
    { id: 'g2', title: 'Excalibur', image: '', link: '/category/Best-Sellers' },
    { id: 'g3', title: 'Wonderful Tonight', image: '', link: '/category/Best-Sellers' },
    { id: 'g4', title: 'A Thing of Beauty', image: '', link: '/category/Best-Sellers' },
    { id: 'g5', title: 'Sweet Dreamzzz', image: '', link: '/category/Best-Sellers' },
    { id: 'g6', title: 'Mama Bear', image: '', link: '/category/Best-Sellers' },
  ],
  spotlightCarouselEnabled: true,
  spotlightCarousel: [
    {
      id: 'sc-1',
      productId: '',
      tagline: 'Say Hello to Purna',
      name: 'Bright as Day',
      description: 'Orange flavoured gummies with Vitamin C, D3 & Zinc for immunity and clear, glowing skin.',
      buttonText: 'EXPLORE >',
      link: '/category/Best-Sellers',
      image: '',
      bgColor: '#f99d26',
      bgGradientEnd: '#ea580c',
    },
    {
      id: 'sc-2',
      productId: '',
      tagline: 'Say Hello to Purna',
      name: 'Youthful You',
      description: 'Superfruits & Collagen Builder with Anti-Aging Beauty & Wellness. Just one delicious gummy a day.',
      buttonText: 'EXPLORE >',
      link: '/category/Best-Sellers',
      image: '',
      bgColor: '#fb923c',
      bgGradientEnd: '#f97316',
    },
    {
      id: 'sc-3',
      productId: '',
      tagline: 'Say Hello to Purna',
      name: 'Sweet Dreamzzz',
      description: 'Melatonin & Valerian Root infused gummies for peaceful nights and refreshing mornings.',
      buttonText: 'EXPLORE >',
      link: '/category/Best-Sellers',
      image: '',
      bgColor: '#8b5cf6',
      bgGradientEnd: '#7c3aed',
    },
  ],
}

export function normalizeHero2Settings(raw) {
  if (!raw) return DEFAULT_HERO2_SETTINGS
  return {
    enabled: raw.enabled !== undefined ? Boolean(raw.enabled) : DEFAULT_HERO2_SETTINGS.enabled,
    showOldHero: Boolean(raw.showOldHero),
    showCategoryStrip: Boolean(raw.showCategoryStrip),
    showBestSellers: Boolean(raw.showBestSellers),
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
    tickerItems: Array.isArray(raw.tickerItems) && raw.tickerItems.length ? raw.tickerItems : DEFAULT_HERO2_SETTINGS.tickerItems,
    circlesEnabled: raw.circlesEnabled !== undefined ? Boolean(raw.circlesEnabled) : DEFAULT_HERO2_SETTINGS.circlesEnabled,
    circles: Array.isArray(raw.circles) && raw.circles.length ? raw.circles : DEFAULT_HERO2_SETTINGS.circles,
    galleryEnabled: raw.galleryEnabled !== undefined ? Boolean(raw.galleryEnabled) : DEFAULT_HERO2_SETTINGS.galleryEnabled,
    galleryTitle: raw.galleryTitle !== undefined ? raw.galleryTitle : DEFAULT_HERO2_SETTINGS.galleryTitle,
    galleryTitleHighlight: raw.galleryTitleHighlight !== undefined ? raw.galleryTitleHighlight : DEFAULT_HERO2_SETTINGS.galleryTitleHighlight,
    galleryCards: Array.isArray(raw.galleryCards) && raw.galleryCards.length ? raw.galleryCards : DEFAULT_HERO2_SETTINGS.galleryCards,
    spotlightCarouselEnabled: raw.spotlightCarouselEnabled !== undefined ? Boolean(raw.spotlightCarouselEnabled) : DEFAULT_HERO2_SETTINGS.spotlightCarouselEnabled,
    spotlightCarousel: Array.isArray(raw.spotlightCarousel) && raw.spotlightCarousel.length ? raw.spotlightCarousel : DEFAULT_HERO2_SETTINGS.spotlightCarousel,
  }
}

export function buildInitialBanners() {
  return defaultBanners.map(normalizeBanner)
}

export function buildInitialCollections() {
  return defaultCollections.map(normalizeCollection)
}

export function buildInitialCategoryCards() {
  return defaultCategoryCards.map(normalizeCategoryCard)
}

export function buildInitialFeatureBanners() {
  return [
    normalizeFeatureBanner({
      id: 'fb-1',
      title: 'Roleplay Costumes',
      subtitle: 'Unleash Your Fantasy.\nOwn the Moment.',
      buttonText: 'Shop Costumes',
      badge1: '50+ Themes',
      badge2: 'Premium Quality',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80',
      slug: 'for-her',
    }),
  ]
}

// Trust badges shown in the features strip above the footer.
export const TRUST_BADGE_ICON_OPTIONS = ['ShieldCheck', 'Truck', 'Headphones', 'Lock', 'RotateCcw', 'Box', 'Gift', 'Sparkles']

export const DEFAULT_TRUST_BADGES = [
  { id: 'tb-1', icon: 'ShieldCheck', title: '100% Discreet', desc: 'Private packaging. Zero product information' },
  { id: 'tb-2', icon: 'ShieldCheck', title: 'Secure Payments', desc: '100% safe, encrypted and trusted' },
  { id: 'tb-3', icon: 'Truck', title: 'Fast & Free Delivery', desc: 'Free shipping on orders ₹1499 and above' },
  { id: 'tb-4', icon: 'Headphones', title: '24/7 Customer Support', desc: 'We are here for you, always' },
]
