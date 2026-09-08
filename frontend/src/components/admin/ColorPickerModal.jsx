import { useRef, useState } from 'react'
import { X, UploadCloud, Palette, Image as ImageIcon, ArrowLeft } from 'lucide-react'
import ColorGrid from './ColorGrid'

const MAX_MB = 2

export default function ColorPickerModal({ onClose, onAdd, requireName = true }) {
  const [mode, setMode] = useState('pick') // 'pick' | 'upload'
  const [step, setStep] = useState('choose') // 'choose' | 'name'
  const [hex, setHex] = useState('')
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const handleSelectHex = (h) => {
    setHex(h)
    setImage('')
    if (requireName) {
      setStep('name')
    } else {
      onAdd({ hex: h })
    }
  }

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please select an image file')
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Image must be under ${MAX_MB}MB`)
    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result)
      setHex('')
      setError('')
      if (requireName) {
        setStep('name')
      } else {
        onAdd({ image: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleConfirm = () => {
    if (!name.trim()) return setError('Please give this color a name')
    onAdd({ name: name.trim(), hex: hex || null, image: image || null })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            {step === 'name' && (
              <button onClick={() => setStep('choose')} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 className="font-bold text-gray-900 text-lg">Add Color</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {step === 'choose' && (
          <div className="p-6">
            <div className="flex bg-gray-100 rounded-full p-0.5 mb-5 w-max">
              <button
                onClick={() => setMode('pick')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${mode === 'pick' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
              >
                <Palette size={14} /> Pick Color
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${mode === 'upload' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
              >
                <ImageIcon size={14} /> Upload Image
              </button>
            </div>

            {mode === 'pick' ? (
              <>
                <p className="text-gray-500 text-sm mb-3">Hover to preview, click a shade to select it</p>
                <ColorGrid onSelect={handleSelectHex} />
              </>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl h-40 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-purple-400 hover:text-purple-500 transition-colors"
              >
                <UploadCloud size={24} className="mb-2" />
                <span className="text-sm font-semibold">Click to upload a swatch image</span>
                <span className="text-[11px] mt-1">PNG or JPG, up to {MAX_MB}MB</span>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              </div>
            )}
            {error && <p className="text-red-500 text-xs font-medium mt-3">{error}</p>}
          </div>
        )}

        {step === 'name' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
              {image ? (
                <img src={image} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg border border-gray-200 shrink-0" style={{ backgroundColor: hex }} />
              )}
              <div>
                <p className="text-gray-500 text-sm">Selected {image ? 'image' : 'color'}</p>
                {hex && <p className="font-mono font-semibold text-gray-700 text-sm">{hex}</p>}
              </div>
            </div>

            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-1.5">Color Name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ocean Blue"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              />
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-full text-white font-bold text-sm transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
            >
              Add Color
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
