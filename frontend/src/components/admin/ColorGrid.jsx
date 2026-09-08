import { useMemo, useState } from 'react'

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

const GRAY_STEPS = [98, 90, 78, 65, 50, 38, 25, 12, 4]
const HUES = Array.from({ length: 18 }, (_, i) => i * 20)
const LIGHTNESS_STEPS = [92, 82, 70, 58, 46, 36, 26, 16]

export default function ColorGrid({ onSelect }) {
  const [hovered, setHovered] = useState(null)

  const grayColumn = useMemo(() => GRAY_STEPS.map((l) => hslToHex(0, 0, l)), [])
  const hueColumns = useMemo(
    () => HUES.map((h) => LIGHTNESS_STEPS.map((l) => hslToHex(h, 75, l))),
    []
  )

  const Cell = ({ hex }) => {
    const isHovered = hovered === hex
    return (
      <button
        type="button"
        onMouseEnter={() => setHovered(hex)}
        onMouseLeave={() => setHovered((h) => (h === hex ? null : h))}
        onClick={() => onSelect(hex)}
        title={hex}
        className="relative aspect-square transition-transform duration-100"
        style={{
          backgroundColor: hex,
          transform: isHovered ? 'scale(1.35)' : 'scale(1)',
          zIndex: isHovered ? 10 : 1,
          boxShadow: isHovered ? '0 4px 14px rgba(0,0,0,0.35)' : 'none',
          borderRadius: isHovered ? 4 : 0,
        }}
      />
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900 p-2">
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${1 + HUES.length}, minmax(0, 1fr))` }}>
        {/* Grayscale column */}
        <div className="grid gap-[2px]" style={{ gridTemplateRows: `repeat(${GRAY_STEPS.length}, 1fr)` }}>
          {grayColumn.map((hex) => <Cell key={hex} hex={hex} />)}
        </div>
        {/* Hue columns */}
        {hueColumns.map((col, ci) => (
          <div key={ci} className="grid gap-[2px]" style={{ gridTemplateRows: `repeat(${LIGHTNESS_STEPS.length}, 1fr)` }}>
            {col.map((hex) => <Cell key={hex} hex={hex} />)}
          </div>
        ))}
      </div>
    </div>
  )
}
