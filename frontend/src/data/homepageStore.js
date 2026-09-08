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
      title: 'Category',
      subtitle: 'Unleash Your Fantasy,\nOver the horizon.',
      buttonText: 'Shop Now',
      badge1: '50+ Themes',
      badge2: 'Premium Quality',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80',
      slug: '',
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
