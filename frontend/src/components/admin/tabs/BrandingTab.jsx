import { useRef } from 'react'
import { UploadCloud, RotateCcw } from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import { DEFAULT_SITE_ASSETS } from '../../../context/ShopContext'

const MAX_SIZE_MB = 2

function AssetUploadCard({ title, description, assetKey, previewClassName }) {
  const { siteAssets, setSiteAsset, resetSiteAsset, showToast } = useShop()
  const inputRef = useRef(null)
  const currentUrl = siteAssets[assetKey]
  const isCustom = currentUrl !== DEFAULT_SITE_ASSETS[assetKey]

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`Image must be under ${MAX_SIZE_MB}MB`)
      return
    }
    // Compress image before saving to keep MongoDB document size small
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX_DIM = 800
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressed = canvas.toDataURL('image/jpeg', 0.82)
        setSiteAsset(assetKey, compressed)
        showToast(`${title} updated`)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900">{title}</h3>
        {isCustom && (
          <button
            onClick={() => { resetSiteAsset(assetKey); showToast(`${title} reset to default`) }}
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-purple-600 transition-colors"
          >
            <RotateCcw size={13} /> Reset to default
          </button>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-4">{description}</p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={`bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${previewClassName}`}>
          <img src={currentUrl} alt={title} className="max-w-full max-h-full object-contain" />
        </div>

        <div className="flex-1 w-full">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <UploadCloud size={16} />
            Upload Image
          </button>
          <p className="text-gray-400 text-[11px] mt-2">PNG or JPG, up to {MAX_SIZE_MB}MB</p>
        </div>
      </div>
    </div>
  )
}

export default function BrandingTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start w-full">
      <AssetUploadCard
        title="Site Logo"
        description="Shown in the navbar and footer across the entire site."
        assetKey="logoUrl"
        previewClassName="w-28 h-20 p-2"
      />
      <AssetUploadCard
        title="Login Page Image"
        description="The illustration shown on the left side of the login page."
        assetKey="loginImageUrl"
        previewClassName="w-28 h-28"
      />
      <AssetUploadCard
        title="Signup Page Image"
        description="The illustration shown on the left side of the signup page."
        assetKey="signupImageUrl"
        previewClassName="w-28 h-28"
      />
    </div>
  )
}
