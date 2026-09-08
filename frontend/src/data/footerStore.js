export const DEFAULT_FOOTER_SETTINGS = {
  tagline: 'PRIVATE. PREMIUM. PLEASURE.',
  description: 'here will be the brand description',
  copyrightText: '© 2024 He & She. All rights reserved.',
  social: {
    instagram: '#',
    facebook: '#',
    twitter: '#',
    linkedin: '#',
  },
}

export function slugifyTitle(title) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const DEFAULT_FOOTER_SHOP_LINKS = [
  { id: 'fs-1', label: 'Best Sellers', slug: 'Best-Sellers' },
  { id: 'fs-2', label: 'New Arrivals', slug: 'New-Arrivals' },
  { id: 'fs-3', label: 'For Him', slug: 'For-Him' },
  { id: 'fs-4', label: 'For Her', slug: 'For-Her' },
  { id: 'fs-5', label: 'For Couples', slug: 'For-Couples' },
  { id: 'fs-6', label: 'LGBTQ+', slug: 'LGBTQ+' },
]

export const DEFAULT_FOOTER_CATEGORY_LINKS = [
  { id: 'fc-1', label: 'Tabs', slug: 'Tab' },
  { id: 'fc-2', label: 'Laptop', slug: 'Laptop' },
  { id: 'fc-3', label: 'Electronics', slug: 'Gadget' },
  { id: 'fc-4', label: 'Oils', slug: 'Oil' },
  { id: 'fc-5', label: 'Massagers', slug: 'Wellness' },
  { id: 'fc-6', label: 'Accessories', slug: 'Accessories' },
]

export const DEFAULT_PAGES = [
  {
    id: 'page-terms',
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    content:
      'Welcome to our store. By accessing or using this website, you agree to be bound by these terms and conditions.\n\nAll products are subject to availability. We reserve the right to discontinue any product at any time.\n\nPrices for our products are subject to change without notice.\n\nFor any questions regarding these terms, please contact our support team.',
  },
  {
    id: 'page-privacy',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content:
      'We value your privacy and are committed to protecting your personal information.\n\nWe collect information you provide directly to us, such as your name, email address, and shipping details, solely to process your orders and improve your experience.\n\nWe do not sell or share your personal information with third parties for marketing purposes.\n\nAll orders are packed and shipped with complete discretion.',
  },
  {
    id: 'page-shipping',
    title: 'Shipping & Delivery',
    slug: 'shipping-and-delivery',
    content:
      'We offer free shipping on all orders above ₹999.\n\nOrders are typically processed within 24 hours and delivered within 3-7 business days depending on your location.\n\nAll packages are shipped in plain, unmarked packaging to ensure complete privacy.',
  },
  {
    id: 'page-returns',
    title: 'Returns & Refunds',
    slug: 'returns-and-refunds',
    content:
      'We accept returns within 7 days of delivery for unopened and unused products in their original packaging.\n\nTo initiate a return, please contact our support team with your order number.\n\nRefunds are processed within 5-7 business days after we receive the returned item.',
  },
  {
    id: 'page-contact',
    title: 'Contact Us',
    slug: 'contact-us',
    content:
      'We would love to hear from you.\n\nEmail: support@hashtelicom.com\nPhone: +91 98765 43210\nHours: Monday to Saturday, 10 AM - 7 PM\n\nOur customer support team typically responds within 24 hours.',
  },
]

export const DEFAULT_FAQS = [
  { id: 'faq-1', question: 'How long does delivery take?', answer: 'Orders are typically delivered within 3-7 business days depending on your location.' },
  { id: 'faq-2', question: 'Is the packaging discreet?', answer: 'Yes, all orders are shipped in plain, unmarked packaging with no product details visible.' },
  { id: 'faq-3', question: 'What is your return policy?', answer: 'We accept returns within 7 days of delivery for unopened, unused products in original packaging.' },
  { id: 'faq-4', question: 'Do you offer cash on delivery?', answer: 'Yes, cash on delivery is available for most locations across India.' },
]
