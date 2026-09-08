// Curated set of icons an admin can pick from when creating/editing a category.
// Keys must match component names importable from 'lucide-react'.
export const CATEGORY_ICON_OPTIONS = [
  'Home', 'User', 'PersonStanding', 'Heart', 'List', 'Flower2', 'Droplet',
  'Camera', 'Music', 'Gift', 'Sparkles', 'Flame', 'Laptop', 'Tablet',
  'Smartphone', 'Headphones', 'Package', 'ShoppingBag', 'Watch', 'Shirt',
]

export function slugify(name) {
  return name ? name.trim().replace(/\s+/g, '-') : ''
}

export function buildInitialCategories() {
  return []
}

