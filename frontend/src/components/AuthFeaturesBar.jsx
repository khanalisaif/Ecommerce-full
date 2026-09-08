import { ShieldCheck, Truck, Headphones, Lock, RotateCcw, Box, Gift, Sparkles } from 'lucide-react'
import { useShop } from '../context/ShopContext'

const iconComponents = { ShieldCheck, Truck, Headphones, Lock, RotateCcw, Box, Gift, Sparkles }

export default function AuthFeaturesBar() {
  const { trustBadges } = useShop()

  return (
    <div className="bg-white border-t border-b border-gray-100 py-6">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {trustBadges.map(({ id, icon, title, desc }) => {
            const Icon = iconComponents[icon] || ShieldCheck
            return (
              <div key={id} className="flex items-center gap-4 py-5 md:py-0 px-4 md:px-8 justify-center md:justify-start">
                <Icon size={30} strokeWidth={1.5} className="text-gray-700 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{title}</h3>
                  <p className="text-gray-600 text-[12.5px] leading-tight mt-0.5">{desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
