import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, Save, UploadCloud, RotateCcw, Plus, Trash2, Eye,
  CheckCircle2, ExternalLink, Sliders, Palette, Tag, Check,
  CircleDot, Layers, Image as ImageIcon, ShoppingBag, ChevronDown, ChevronUp,
  ArrowLeftRight, ShieldCheck, Flower2
} from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import { compressImageFile } from '../../../utils/imageUtils'
import { DEFAULT_HERO2_SETTINGS } from '../../../data/homepageStore'
import HeroProductSelectModal from '../HeroProductSelectModal'

const MAX_MB = 2

const ICON_OPTIONS = [
  { value: 'Halal', label: 'Halal (حلال)' },
  { value: 'ISO', label: 'ISO Certificate' },
  { value: 'FSSAI', label: 'FSSAI Approved' },
  { value: 'Leaf', label: 'Leaf / Gelatin-Free' },
  { value: 'Keto', label: 'Keto Friendly' },
  { value: 'GMP', label: 'GMP Certified' },
]

function ColorPickerInput({ label, value, onChange, fallback = '#fce4ec', className = '' }) {
  const currentVal = value || fallback
  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <label className="block text-gray-700 font-bold text-[11px] sm:text-xs mb-1.5 truncate" title={label}>
          {label}
        </label>
      )}
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={currentVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white shrink-0 hover:border-pink-500 transition-colors shadow-xs"
          title="Click to open color picker"
        />
        <input
          type="text"
          value={currentVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#FFFFFF"
          className="w-full min-w-0 px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono uppercase text-gray-700 focus:outline-none focus:border-pink-500"
        />
      </div>
    </div>
  )
}

function CategoryLinkSelect({ label = 'Button Link / Category', value, onChange, categories = [], extraOptions = [], className = '' }) {
  const currentLink = value || '/category/Best-Sellers'
  const isStandard =
    currentLink === '/category/Best-Sellers' ||
    currentLink === '/category/For-You' ||
    categories.some((c) => `/category/${c.slug}` === currentLink) ||
    extraOptions.some((opt) => opt.value === currentLink)

  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <label className="block text-gray-700 font-bold text-[11px] sm:text-xs mb-1.5 truncate" title={label}>
          {label}
        </label>
      )}
      <select
        value={currentLink}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-pink-500 bg-white text-gray-800 truncate"
      >
        {extraOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {!isStandard && currentLink && (
          <option value={currentLink}>Custom: {currentLink}</option>
        )}
        <option value="/category/Best-Sellers">Best Sellers (/category/Best-Sellers)</option>
        <option value="/category/For-You">For You (/category/For-You)</option>
        {categories.map((c) => (
          <option key={c.id || c.slug} value={`/category/${c.slug}`}>
            {c.name} (/category/{c.slug})
          </option>
        ))}
      </select>
    </div>
  )
}

export default function Hero2Tab() {
  const { hero2Settings, updateHero2Settings, categories, products, showToast } = useShop()

  const [form, setForm] = useState(() => ({
    ...DEFAULT_HERO2_SETTINGS,
    ...(hero2Settings || {}),
  }))

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [spotlightModalOpen, setSpotlightModalOpen] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (hero2Settings) {
      setForm((prev) => ({
        ...DEFAULT_HERO2_SETTINGS,
        ...hero2Settings,
      }))
    }
  }, [hero2Settings])

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleFileUpload = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB}MB`)
      return
    }
    setError('')
    try {
      const compressed = await compressImageFile(file)
      handleFieldChange('image', compressed)
      showToast('Image uploaded successfully')
    } catch {
      setError('Failed to process image')
    }
  }

  // Ticker items management
  const handleTickerTextChange = (idx, newText) => {
    const updated = [...(form.tickerItems || [])]
    updated[idx] = { ...updated[idx], text: newText }
    handleFieldChange('tickerItems', updated)
  }

  const handleTickerIconChange = (idx, newIcon) => {
    const updated = [...(form.tickerItems || [])]
    updated[idx] = { ...updated[idx], icon: newIcon }
    handleFieldChange('tickerItems', updated)
  }

  const handleTickerImageUpload = async (idx, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB}MB`)
      return
    }
    setError('')
    try {
      const compressed = await compressImageFile(file)
      const updated = [...(form.tickerItems || [])]
      updated[idx] = { ...updated[idx], image: compressed }
      handleFieldChange('tickerItems', updated)
      showToast('Certificate badge image uploaded successfully')
    } catch {
      setError('Failed to upload certificate image')
    }
  }

  const handleTickerImageClear = (idx) => {
    const updated = [...(form.tickerItems || [])]
    updated[idx] = { ...updated[idx], image: '' }
    handleFieldChange('tickerItems', updated)
    showToast('Badge image removed')
  }

  const handleAddTickerItem = () => {
    const updated = [
      ...(form.tickerItems || []),
      { id: `t-${Date.now()}`, text: 'New Certificate', icon: 'Leaf', image: '' },
    ]
    handleFieldChange('tickerItems', updated)
  }

  const handleRemoveTickerItem = (idx) => {
    const updated = (form.tickerItems || []).filter((_, i) => i !== idx)
    handleFieldChange('tickerItems', updated)
  }

  // Badges management
  const [badgesInput, setBadgesInput] = useState(() => (form.badges || []).join(', '))

  useEffect(() => {
    setBadgesInput((form.badges || []).join(', '))
  }, [form.badges])

  const handleBadgesBlur = () => {
    const arr = badgesInput.split(',').map((s) => s.trim()).filter(Boolean)
    handleFieldChange('badges', arr)
  }

  // Circle Items Management (Under ticker)
  const handleCircleChange = (idx, field, value) => {
    const updated = [...(form.circles || [])]
    updated[idx] = { ...updated[idx], [field]: value }
    handleFieldChange('circles', updated)
  }

  const handleCircleImageUpload = async (idx, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB}MB`)
      return
    }
    setError('')
    try {
      const compressed = await compressImageFile(file)
      handleCircleChange(idx, 'image', compressed)
      showToast('Circle image uploaded successfully')
    } catch {
      setError('Failed to upload image')
    }
  }

  const handleAddCircle = () => {
    const updated = [
      ...(form.circles || []),
      {
        id: `c-${Date.now()}`,
        name: 'New Product',
        image: '',
        link: '/category/Best-Sellers',
        bg: '#fce4ec',
      },
    ]
    handleFieldChange('circles', updated)
  }

  const handleRemoveCircle = (idx) => {
    const updated = (form.circles || []).filter((_, i) => i !== idx)
    handleFieldChange('circles', updated)
  }

  // Gallery Cards Management (Under Hero Product Banner)
  const handleCardChange = (idx, field, value) => {
    const updated = [...(form.galleryCards || [])]
    updated[idx] = { ...updated[idx], [field]: value }
    handleFieldChange('galleryCards', updated)
  }

  const handleCardImageUpload = async (idx, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB}MB`)
      return
    }
    setError('')
    try {
      const compressed = await compressImageFile(file)
      handleCardChange(idx, 'image', compressed)
      showToast('Gallery card image uploaded successfully')
    } catch {
      setError('Failed to upload image')
    }
  }

  const handleAddCard = () => {
    const updated = [
      ...(form.galleryCards || []),
      {
        id: `g-${Date.now()}`,
        title: 'New Wellness Card',
        image: '/wellness-card-clean-orange.png',
        link: '/category/Best-Sellers',
      },
    ]
    handleFieldChange('galleryCards', updated)
  }

  const handleRemoveCard = (idx) => {
    const updated = (form.galleryCards || []).filter((_, i) => i !== idx)
    handleFieldChange('galleryCards', updated)
  }

  // ---------------- Multi-Product Spotlight Carousel Handlers ----------------
  const handleSpotlightChange = (idx, field, value) => {
    const updated = [...(form.spotlightCarousel || [])]
    updated[idx] = { ...updated[idx], [field]: value }
    handleFieldChange('spotlightCarousel', updated)
  }

  const handleSpotlightImageUpload = async (idx, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB}MB`)
      return
    }
    setError('')
    try {
      const compressed = await compressImageFile(file)
      handleSpotlightChange(idx, 'image', compressed)
      showToast('Product slide image uploaded successfully')
    } catch {
      setError('Failed to upload image')
    }
  }

  const handleSelectProductForSpotlight = (selectedProduct) => {
    // Extract clean 3-line description (~150-180 chars)
    let shortDesc = 'Premium natural formulation designed for everyday wellness and personal care.'
    if (selectedProduct.description) {
      const stripped = selectedProduct.description
        .replace(/[*#_`]/g, '')
        .replace(/<[^>]*>?/gm, '')
        .trim()

      const paragraphs = stripped.split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const descPara =
        paragraphs.find((p) => p.length > 50 && !p.includes(' – ') && !p.startsWith('-') && !p.includes('Key Features')) ||
        paragraphs.find((p) => p.length > 40 && !p.startsWith('-')) ||
        paragraphs[0] ||
        ''
      if (descPara) {
        if (descPara.length > 180) {
          const cut = descPara.slice(0, 175)
          const lastSpace = cut.lastIndexOf(' ')
          shortDesc = (lastSpace > 120 ? cut.slice(0, lastSpace) : cut) + '...'
        } else if (descPara.length < 110) {
          const period = descPara.endsWith('.') ? '' : '.'
          shortDesc = `${descPara}${period} Crafted with premium natural ingredients to elevate your daily vitality, balance and mindful self-care routine.`
        } else {
          shortDesc = descPara
        }
      }
    }

    const newSlide = {
      id: `sc-${Date.now()}`,
      productId: selectedProduct.id,
      tagline: `Say Hello to ${selectedProduct.brand_name || selectedProduct.brand || 'Zenpha'}`,
      name: selectedProduct.name,
      description: shortDesc,
      buttonText: 'EXPLORE >',
      link: `/product/${selectedProduct.id}`,
      image: selectedProduct.image,
      bgColor: '#f99d26',
      bgGradientEnd: '#ea580c',
    }
    const updated = [...(form.spotlightCarousel || []), newSlide]
    handleFieldChange('spotlightCarousel', updated)
    showToast(`"${selectedProduct.name}" added to Spotlight Carousel!`)
    setSpotlightModalOpen(false)
  }

  const handleAddCustomSpotlight = () => {
    const newSlide = {
      id: `sc-${Date.now()}`,
      productId: '',
      tagline: 'Say Hello to Zenpha',
      name: 'New Spotlight Product',
      description: 'Orange flavoured gummies with Vitamin C, D3 & Zinc for immunity and clear, glowing skin. Daily essential vitamins for your overall vitality and wellness.',
      buttonText: 'EXPLORE >',
      link: '/category/Best-Sellers',
      image: '',
      bgColor: '#f99d26',
      bgGradientEnd: '#ea580c',
    }
    const updated = [...(form.spotlightCarousel || []), newSlide]
    handleFieldChange('spotlightCarousel', updated)
  }

  const handleRemoveSpotlight = (idx) => {
    const updated = (form.spotlightCarousel || []).filter((_, i) => i !== idx)
    handleFieldChange('spotlightCarousel', updated)
  }

  const handleMoveSpotlight = (idx, direction) => {
    const list = [...(form.spotlightCarousel || [])]
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= list.length) return
    const temp = list[idx]
    list[idx] = list[targetIdx]
    list[targetIdx] = temp
    handleFieldChange('spotlightCarousel', list)
  }

  const handleSave = (e) => {
    e?.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        badges: badgesInput.split(',').map((s) => s.trim()).filter(Boolean),
      }
      updateHero2Settings(payload)
      showToast('Hero 2 settings saved successfully!')
    } catch (err) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefault = () => {
    if (window.confirm('Reset all Hero 2 settings to default?')) {
      setForm(DEFAULT_HERO2_SETTINGS)
      updateHero2Settings(DEFAULT_HERO2_SETTINGS)
      showToast('Hero 2 reset to default')
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto px-1 sm:px-2">
      {/* ── Top Action Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight truncate">
              Hero 2 Management
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm line-clamp-1">
              Manage New Hero Banner, Ticker, Circles Strip, Wellness Slider & Spotlight Carousel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Live Preview Card ─────────────────────────────────── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Eye size={16} className="text-pink-600" /> Live Preview
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active on Homepage
          </span>
        </div>

        {/* Scaled Banner Preview Box */}
        <div
          className="rounded-2xl overflow-hidden p-6 sm:p-8 border border-pink-100 flex flex-col md:flex-row items-center justify-between gap-6 relative"
          style={{
            background: `linear-gradient(135deg, ${form.bgColor || '#fce4ec'} 0%, ${form.bgGradientEnd || '#fed7e2'} 100%)`,
          }}
        >
          <div className="flex-1 text-center md:text-left">
            <p className="text-[10px] font-black text-pink-600 tracking-widest uppercase mb-1">
              {form.tagline}
            </p>
            <h4 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-2">
              {form.title}{' '}
              <span className="text-pink-600">{form.titleHighlight}</span>
            </h4>
            <p className="text-gray-700 text-xs leading-relaxed max-w-md mb-4 font-medium">
              {form.description}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4 text-[11px] font-bold text-gray-800">
              {(form.badges || []).map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  • {b}
                </span>
              ))}
            </div>
            <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs px-6 py-2.5 rounded-full shadow-md uppercase tracking-wider">
              {form.buttonText || 'SHOP NOW'}
            </button>
          </div>

          <div className="w-full md:w-64 h-48 flex items-center justify-center">
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="max-h-full max-w-full object-contain drop-shadow-md"
              />
            )}
          </div>
        </div>

        {/* Ticker Preview */}
        <div
          className="py-2.5 px-4 rounded-xl flex items-center gap-4 overflow-hidden text-white text-xs font-bold"
          style={{ backgroundColor: form.tickerBgColor || '#d81b60' }}
        >
          <span className="text-[10px] uppercase tracking-wider opacity-75 shrink-0">Ticker:</span>
          <div className="flex items-center gap-5 overflow-x-auto scrollbar-none py-0.5">
            {(form.tickerItems || []).map((t, idx) => (
              <span key={idx} className="whitespace-nowrap flex items-center gap-1.5 text-[11px]">
                {t.image ? (
                  <img
                    src={t.image}
                    alt=""
                    className="h-4 w-auto max-w-[28px] object-contain inline-block drop-shadow-xs"
                  />
                ) : (
                  <span>✓</span>
                )}
                {t.text && <span>{t.text}</span>}
                <span className="opacity-40 ml-1">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Circles Strip Preview */}
        {form.circlesEnabled !== false && (
          <div className="pt-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Circles Showcase Preview:
            </p>
            <div className="flex items-center gap-4 overflow-x-auto py-2 scrollbar-none">
              {(form.circles || []).map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center p-1.5 border border-black/5"
                    style={{ backgroundColor: c.bg || '#fce4ec' }}
                  >
                    {c.image && <img src={c.image} alt="" className="w-full h-full object-contain" />}
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 max-w-[65px] truncate text-center">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Form Settings Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Text & Content */}
        <div className="lg:col-span-6 xl:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b pb-3">
            <Tag size={16} className="text-pink-600 shrink-0" /> Banner Typography & Content
          </h3>

          <div>
            <label className="block text-gray-700 font-bold text-xs mb-1.5">Top Tagline / Kicker</label>
            <input
              type="text"
              value={form.tagline || ''}
              onChange={(e) => handleFieldChange('tagline', e.target.value)}
              placeholder="e.g. PURNA GUMMIES · ONE A DAY"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold text-xs mb-1.5">Main Title (Start)</label>
              <input
                type="text"
                value={form.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. Your Daily"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold text-xs mb-1.5">Highlighted Text (Pink)</label>
              <input
                type="text"
                value={form.titleHighlight || ''}
                onChange={(e) => handleFieldChange('titleHighlight', e.target.value)}
                placeholder="e.g. Dose of Goodness"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-medium text-pink-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold text-xs mb-1.5">Description / Subtitle</label>
            <textarea
              rows={3}
              value={form.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Tasty, vegan gummies for beauty, immunity, sleep and everyday wellness. Just one a day."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-medium resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold text-xs mb-1.5">Feature Badges (comma-separated)</label>
            <input
              type="text"
              value={badgesInput}
              onChange={(e) => setBadgesInput(e.target.value)}
              onBlur={handleBadgesBlur}
              placeholder="100% Vegan, Gelatin-Free, One a Day"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-medium"
            />
            <p className="text-[11px] text-gray-400 mt-1">Separate each feature tag with a comma</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-gray-700 font-bold text-xs mb-1.5">Button Text</label>
              <input
                type="text"
                value={form.buttonText || ''}
                onChange={(e) => handleFieldChange('buttonText', e.target.value)}
                placeholder="SHOP NOW"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>
            <CategoryLinkSelect
              label="Button Link / Category"
              value={form.buttonLink}
              onChange={(val) => handleFieldChange('buttonLink', val)}
              categories={categories}
            />
          </div>
        </div>

        {/* Right Column: Image & Color Settings */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-6 min-w-0">
          {/* Image Upload Box */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b pb-3">
              <UploadCloud size={16} className="text-pink-600 shrink-0" /> Hero Image
            </h3>

            <div>
              <label className="block text-gray-700 font-bold text-xs mb-2">Product Banner Image</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden p-2 shrink-0">
                  {form.image ? (
                    <img src={form.image} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <UploadCloud size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors cursor-pointer border border-pink-200"
                  >
                    Upload New Image
                  </button>
                  <p className="text-[11px] text-gray-400">PNG or JPG under 2MB. Clear background recommended.</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                />
              </div>
            </div>
          </div>

          {/* Color & Theme Styling */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b pb-3">
              <Palette size={16} className="text-pink-600 shrink-0" /> Theme & Ticker Colors
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <ColorPickerInput
                label="Banner Start Color"
                value={form.bgColor}
                onChange={(val) => handleFieldChange('bgColor', val)}
                fallback="#fce4ec"
              />
              <ColorPickerInput
                label="Banner End Color"
                value={form.bgGradientEnd}
                onChange={(val) => handleFieldChange('bgGradientEnd', val)}
                fallback="#fed7e2"
              />
              <ColorPickerInput
                label="Ticker Background"
                value={form.tickerBgColor}
                onChange={(val) => handleFieldChange('tickerBgColor', val)}
                fallback="#d81b60"
              />
            </div>

            {/* Visibility Toggles */}
            <div className="pt-2 border-t border-gray-100 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Enable Hero 2 Banner</span>
                  <span className="text-[11px] text-gray-400">Shows the new hero banner on the homepage</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.enabled !== false}
                  onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Show Legacy Hero Carousel</span>
                  <span className="text-[11px] text-gray-400">Rotating carousel at the top of the homepage</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.showOldHero)}
                  onChange={(e) => handleFieldChange('showOldHero', e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Show Category Tabs Strip</span>
                  <span className="text-[11px] text-gray-400">Couples, For Her, For Him, Wellness, Lubricants</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.showCategoryStrip)}
                  onChange={(e) => handleFieldChange('showCategoryStrip', e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Show Category Cards</span>
                  <span className="text-[11px] text-gray-400">The 5-column image grid below the hero banner</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.showCollections !== false}
                  onChange={(e) => handleFieldChange('showCollections', e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Show Sub Category Cards</span>
                  <span className="text-[11px] text-gray-400">The large feature cards further down the homepage</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.showSubCategoryCards !== false}
                  onChange={(e) => handleFieldChange('showSubCategoryCards', e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Show Best Sellers Section</span>
                  <span className="text-[11px] text-gray-400">Ashwagandha Gummies, Herbal Teas, etc.</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.showBestSellers)}
                  onChange={(e) => handleFieldChange('showBestSellers', e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Show Hero Product Banner</span>
                  <span className="text-[11px] text-gray-400">Spotlight product banner shown directly above Feature Banner or below Best Sellers</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.showHeroProductBanner !== false}
                  onChange={(e) => handleFieldChange('showHeroProductBanner', e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Show Feature Banner</span>
                  <span className="text-[11px] text-gray-400">Full-width dark promo strip with two badges</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.showFeatureBanner !== false}
                  onChange={(e) => handleFieldChange('showFeatureBanner', e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ticker Items Management Section ─────────────────────── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Sliders size={16} className="text-pink-600 shrink-0" /> Continuous Certification Ticker (Right to Left)
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              These items continuously scroll right-to-left under the banner. Upload transparent PNG or JPG badges (under 2MB, clear background recommended).
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddTickerItem}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-pink-200 cursor-pointer shrink-0"
          >
            <Plus size={14} /> Add Certification
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {(form.tickerItems || []).map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row items-start gap-3.5 relative group hover:border-pink-300 transition-colors min-w-0"
            >
              {/* Badge Image Preview & Upload Trigger */}
              <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start w-full sm:w-auto gap-2 shrink-0">
                <div
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center p-2 shadow-xs relative overflow-hidden shrink-0"
                  style={{
                    backgroundImage: !item.image
                      ? 'none'
                      : 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.text || 'Certificate'}
                      className="w-full h-full object-contain drop-shadow-xs"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <UploadCloud size={20} className="text-gray-400" />
                      <span className="text-[9px] font-bold text-gray-400 mt-0.5">Badge</span>
                    </div>
                  )}
                </div>

                <label
                  htmlFor={`ticker-file-${idx}`}
                  className="text-[11px] font-bold text-pink-600 hover:text-pink-700 cursor-pointer underline decoration-dotted px-2 py-0.5 rounded bg-pink-50 sm:bg-transparent"
                >
                  {item.image ? 'Change' : 'Upload'}
                </label>
                <input
                  id={`ticker-file-${idx}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleTickerImageUpload(idx, e.target.files?.[0])}
                />
              </div>

              {/* Text Field & Info */}
              <div className="flex-1 space-y-2 min-w-0 w-full">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Certificate Title
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveTickerItem(idx)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer shrink-0"
                    title="Remove Certification"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <input
                  type="text"
                  value={item.text || ''}
                  onChange={(e) => handleTickerTextChange(idx, e.target.value)}
                  placeholder="e.g. Halal Certified"
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-pink-500"
                />

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                  <span className="truncate">PNG or JPG under 2MB. Clear background.</span>
                  {item.image && (
                    <button
                      type="button"
                      onClick={() => handleTickerImageClear(idx)}
                      className="text-red-500 hover:text-red-700 font-semibold cursor-pointer shrink-0 ml-1 underline decoration-dotted"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Circular Products Showcase Strip Management ─────────── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <CircleDot size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm truncate">
                  Circular Products Showcase Strip (Directly Below Ticker)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 shrink-0">
                  Image #1
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                Circular product bubbles directly under the certificate marquee ticker. Mobile swipeable & responsive.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.circlesEnabled !== false}
                onChange={(e) => handleFieldChange('circlesEnabled', e.target.checked)}
                className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
              />
              <span>Enabled</span>
            </label>
            <button
              type="button"
              onClick={handleAddCircle}
              className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-pink-200 cursor-pointer"
            >
              <Plus size={14} /> Add Circle
            </button>
          </div>
        </div>

        {/* Circles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(form.circles || []).map((circle, idx) => (
            <div
              key={circle.id || idx}
              className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row items-start gap-3.5 relative group hover:border-pink-300 transition-colors min-w-0"
            >
              {/* Circle Avatar Preview & Upload Trigger */}
              <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start w-full sm:w-auto gap-2 shrink-0">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center p-2 border border-black/5 shadow-xs relative overflow-hidden shrink-0"
                  style={{ backgroundColor: circle.bg || '#fce4ec' }}
                >
                  {circle.image ? (
                    <img src={circle.image} alt="" className="w-full h-full object-contain drop-shadow-xs" />
                  ) : (
                    <UploadCloud size={20} className="text-gray-400" />
                  )}
                </div>

                <label
                  htmlFor={`circle-file-${idx}`}
                  className="text-[11px] font-bold text-pink-600 hover:text-pink-700 cursor-pointer underline decoration-dotted px-2 py-0.5 rounded bg-pink-50 sm:bg-transparent"
                >
                  Change
                </label>
                <input
                  id={`circle-file-${idx}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCircleImageUpload(idx, e.target.files?.[0])}
                />
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-2.5 min-w-0 w-full">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={circle.name || ''}
                    onChange={(e) => handleCircleChange(idx, 'name', e.target.value)}
                    placeholder="Product Name (e.g. Pretty Woman)"
                    className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCircle(idx)}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Delete circle"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="space-y-2 w-full">
                  <CategoryLinkSelect
                    label="Button Link / Category"
                    value={circle.link}
                    onChange={(val) => handleCircleChange(idx, 'link', val)}
                    categories={categories}
                  />

                  <ColorPickerInput
                    label="Circle Pastel BG"
                    value={circle.bg}
                    onChange={(val) => handleCircleChange(idx, 'bg', val)}
                    fallback="#fce4ec"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Everyday Wellness Floating Gallery Slider Management ──── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm">
                  Everyday Wellness Floating Gallery Slider (Below Edible Massage Oil Banner)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 shrink-0">
                  Images #2 & #3
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                Slow infinite right-to-left sliding cards. On hover or touch, cards lift upwards with elevation shadow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.galleryEnabled !== false}
                onChange={(e) => handleFieldChange('galleryEnabled', e.target.checked)}
                className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
              />
              <span>Enabled</span>
            </label>
            <button
              type="button"
              onClick={handleAddCard}
              className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-pink-200 cursor-pointer"
            >
              <Plus size={14} /> Add Wellness Card
            </button>
          </div>
        </div>

        {/* Section Title & Background Colors Settings */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold text-xs mb-1">Section Title (Dark)</label>
              <input
                type="text"
                value={form.galleryTitle || ''}
                onChange={(e) => handleFieldChange('galleryTitle', e.target.value)}
                placeholder="EVERYDAY WELLNESS."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold text-xs mb-1">Highlight Title (Pink)</label>
              <input
                type="text"
                value={form.galleryTitleHighlight || ''}
                onChange={(e) => handleFieldChange('galleryTitleHighlight', e.target.value)}
                placeholder="SIMPLY PURNA."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-pink-600 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200/80">
            <span className="block text-gray-700 font-bold text-xs mb-2">Slider Background Colors</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorPickerInput
                label="Slider Start Color"
                value={form.galleryBgColor}
                onChange={(val) => handleFieldChange('galleryBgColor', val)}
                fallback="#fce4ec"
              />
              <ColorPickerInput
                label="Slider End Color"
                value={form.galleryBgGradientEnd}
                onChange={(val) => handleFieldChange('galleryBgGradientEnd', val)}
                fallback="#fed7e2"
              />
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(form.galleryCards || []).map((card, idx) => (
            <div
              key={card.id || idx}
              className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between gap-3 group hover:border-pink-300 transition-colors min-w-0"
            >
              <div className="space-y-2.5 min-w-0">
                {/* Card Image Preview with Upload */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-200 border border-gray-200 flex items-center justify-center group/img">
                  {card.image ? (
                    <img src={card.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UploadCloud size={28} className="text-gray-400" />
                  )}

                  <label
                    htmlFor={`card-file-${idx}`}
                    className="absolute inset-0 bg-black/40 text-white font-bold text-xs flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer gap-1.5"
                  >
                    <UploadCloud size={16} /> Change Image
                  </label>
                  <input
                    id={`card-file-${idx}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleCardImageUpload(idx, e.target.files?.[0])}
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Card Title</label>
                  <input
                    type="text"
                    value={card.title || ''}
                    onChange={(e) => handleCardChange(idx, 'title', e.target.value)}
                    placeholder="e.g. Youthful You"
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <CategoryLinkSelect
                  label="Button Link / Category"
                  value={card.link}
                  onChange={(val) => handleCardChange(idx, 'link', val)}
                  categories={categories}
                />
              </div>

              <div className="flex justify-end pt-1 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleRemoveCard(idx)}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer py-1 px-2 rounded-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} /> Remove Card
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Multi-Product Spotlight 3D Carousel Management (Image #1) ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <ArrowLeftRight size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm">
                  Multi-Product Spotlight Carousel (Below Everyday Wellness)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 shrink-0">
                  Image #1
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                Multi-product slider with left/right buttons. Image is placed on the RIGHT side.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.spotlightCarouselEnabled !== false}
                onChange={(e) => handleFieldChange('spotlightCarouselEnabled', e.target.checked)}
                className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
              />
              <span>Enabled</span>
            </label>

            <button
              type="button"
              onClick={() => setSpotlightModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-purple-200 cursor-pointer"
            >
              <ShoppingBag size={14} /> Select Product from Store
            </button>

            <button
              type="button"
              onClick={handleAddCustomSpotlight}
              className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-pink-200 cursor-pointer"
            >
              <Plus size={14} /> Add Slide
            </button>
          </div>
        </div>

        {/* Carousel Slides List */}
        <div className="space-y-4">
          {(form.spotlightCarousel || []).map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="p-4 sm:p-5 bg-gray-50 rounded-2xl border border-gray-200/90 space-y-4 relative group hover:border-orange-300 transition-colors min-w-0"
            >
              {/* Header Bar of the Slide */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 leading-tight truncate">
                      {slide.name || 'Untitled Slide'}
                    </h4>
                    <span className="text-[11px] text-gray-500 font-medium truncate block">
                      {slide.tagline || 'Say Hello to Zenpha'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleMoveSpotlight(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                    title="Move slide left/up"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSpotlight(idx, 1)}
                    disabled={idx === (form.spotlightCarousel || []).length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                    title="Move slide right/down"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpotlight(idx)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 cursor-pointer ml-1 sm:ml-2"
                    title="Delete slide"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Slide Fields Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left/Middle: Text, Description, Button, Callouts */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-3 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Top Tagline</label>
                      <input
                        type="text"
                        value={slide.tagline || ''}
                        onChange={(e) => handleSpotlightChange(idx, 'tagline', e.target.value)}
                        placeholder="Say Hello to Zenpha"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Product Title</label>
                      <input
                        type="text"
                        value={slide.name || ''}
                        onChange={(e) => handleSpotlightChange(idx, 'name', e.target.value)}
                        placeholder="Bright as Day"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Description (~3 lines)
                    </label>
                    <textarea
                      rows={3}
                      value={slide.description || ''}
                      onChange={(e) => handleSpotlightChange(idx, 'description', e.target.value)}
                      placeholder="Orange flavoured gummies with Vitamin C, D3 & Zinc for immunity and clear, glowing skin. Daily essential vitamins for your overall health & vitality."
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium resize-none focus:outline-none focus:border-orange-500 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={slide.buttonText || 'EXPLORE >'}
                        onChange={(e) => handleSpotlightChange(idx, 'buttonText', e.target.value)}
                        placeholder="EXPLORE >"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <CategoryLinkSelect
                      label="Button Link / Category"
                      value={slide.link}
                      onChange={(val) => handleSpotlightChange(idx, 'link', val)}
                      categories={categories}
                      extraOptions={
                        slide.productId
                          ? [
                            {
                              value: `/product/${slide.productId}`,
                              label: `Linked Product Page (/product/${slide.productId.slice(-6)})`,
                            },
                          ]
                          : []
                      }
                    />
                  </div>
                </div>

                {/* Right: Colors & Image */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-3 min-w-0">
                  {/* Colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <ColorPickerInput
                      label="Start Color"
                      value={slide.bgColor}
                      onChange={(val) => handleSpotlightChange(idx, 'bgColor', val)}
                      fallback="#f99d26"
                    />
                    <ColorPickerInput
                      label="End Color"
                      value={slide.bgGradientEnd}
                      onChange={(val) => handleSpotlightChange(idx, 'bgGradientEnd', val)}
                      fallback="#ea580c"
                    />
                  </div>

                  {/* Image Preview & Upload */}
                  <div className="min-w-0">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Product Image (Right Side)
                    </label>
                    <div
                      className="w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-black/5 flex items-center justify-center relative p-3"
                      style={{
                        background: `linear-gradient(135deg, ${slide.bgColor || '#f99d26'} 0%, ${slide.bgGradientEnd || '#ea580c'} 100%)`,
                      }}
                    >
                      {slide.image ? (
                        <img src={slide.image} alt="" className="max-h-full max-w-full object-contain drop-shadow-md" />
                      ) : (
                        <UploadCloud size={24} className="text-white/60" />
                      )}

                      <label
                        htmlFor={`spotlight-img-${idx}`}
                        className="absolute inset-0 bg-black/40 text-white font-bold text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer gap-1.5"
                      >
                        <UploadCloud size={16} /> Upload Image
                      </label>
                      <input
                        id={`spotlight-img-${idx}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSpotlightImageUpload(idx, e.target.files?.[0])}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Product Selection Modal (from store) ───────────────── */}
      {spotlightModalOpen && (
        <HeroProductSelectModal
          products={products}
          categories={categories}
          selectedProductId={null}
          onClose={() => setSpotlightModalOpen(false)}
          onSelect={handleSelectProductForSpotlight}
        />
      )}

      {/* Bottom Save Bar */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-black transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-70"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Hero 2 Settings'}
        </button>
      </div>
    </div>
  )
}
