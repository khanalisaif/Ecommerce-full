import { useShop } from '../context/ShopContext'

export default function Logo({ size = 'md', boxed = false, className = '' }) {
  const { siteAssets } = useShop()
  const imgSizes = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-24',
  }
  const heightClass = imgSizes[size] || imgSizes.md

  const mark = (
    <div className={className}>
      <img src={siteAssets.logoUrl} alt="Logo" className={`${heightClass} w-auto object-contain`} />
    </div>
  )

  if (!boxed) return mark

  return (
    <div className="bg-white px-6 py-4 rounded-lg shadow-xl inline-block">
      {mark}
    </div>
  )
}
