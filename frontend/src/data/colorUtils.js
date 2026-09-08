// Best-effort name -> hex lookup for legacy plain-string colors (kept for
// backward compatibility with products created before the visual color
// picker existed).
export const LEGACY_COLOR_HEX_MAP = {
  Black: '#111827', White: '#f9fafb', Silver: '#c0c0c0', Vanilla: '#f3e5ab',
  Musk: '#8b5a2b', Rose: '#e8b4bc', Blue: '#2563eb', Red: '#dc2626',
  Pink: '#ec4899', Grey: '#9ca3af', Gray: '#9ca3af', Green: '#16a34a',
  Yellow: '#eab308', Purple: '#9333ea', Orange: '#f97316', Brown: '#78350f',
  Gold: '#d4af37', Beige: '#e8dcc8', Navy: '#1e3a8a', Maroon: '#7f1d1d',
}

const INDEX_FALLBACK = ['#111827', '#9ca3af', '#f9fafb']

// Normalizes one color entry — which might be:
//   - a plain string (legacy data, e.g. "Black")
//   - a rich object from the color picker: { name, hex, image }
// into a consistent { name, hex, image } shape.
export function normalizeColorEntry(raw, index = 0) {
  if (raw && typeof raw === 'object') {
    return {
      name: raw.name || 'Color',
      hex: raw.hex || null,
      image: raw.image || null,
      images: raw.images || [],
      stock: raw.stock !== undefined ? raw.stock : undefined,
    }
  }
  const name = String(raw || 'Color')
  return {
    name,
    hex: LEGACY_COLOR_HEX_MAP[name] || null,
    image: null,
    images: [],
    stock: undefined,
  }
}

export function normalizeColorList(rawList) {
  if (!Array.isArray(rawList) || !rawList.length) return []
  return rawList.map((c, i) => normalizeColorEntry(c, i))
}

// The plain display name for a color entry, whether it's already a string
// (legacy) or a rich { name, hex, image } object.
export function getColorName(c) {
  if (!c) return ''
  return typeof c === 'object' ? c.name || '' : c
}

// CSS style object for rendering a swatch button, with a sensible fallback
// pattern (black/grey/white cycling by index) when no hex/image is set —
// matches the look older products had before real colors existed.
export function getSwatchStyle(color, index = 0) {
  if (color?.image) {
    return { backgroundImage: `url(${color.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  if (color?.hex) {
    return { backgroundColor: color.hex }
  }
  return { backgroundColor: INDEX_FALLBACK[index % INDEX_FALLBACK.length] }
}
