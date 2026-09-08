import { Globe, Headphones } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'

export default function AuthTopBar() {
  const navigate = useNavigate()
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="text-left flex-shrink-0 flex items-center">
          <Logo size="sm" />
        </button>

        {/* Right info */}
        <div className="flex items-center gap-6 text-sm text-gray-700">
          <div className="hidden sm:flex items-center gap-1.5 text-gray-600 text-sm">
            <Globe size={16} className="text-gray-400" />
            <span className="text-xs">
              Ship to <span className="font-semibold text-gray-800">India</span> ⌄
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-gray-400" />
            <div className="leading-tight">
              <p className="text-[10px] text-gray-400">Need Help?</p>
              <p className="text-xs font-semibold text-gray-800">+91 00000 00000</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
