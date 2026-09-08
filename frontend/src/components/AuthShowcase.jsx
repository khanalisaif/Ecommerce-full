export default function AuthShowcase({ imageSrc, altText = 'Auth Panel' }) {
  return (
    <div className="hidden lg:block relative overflow-hidden">
      <img
        src={imageSrc}
        alt={altText}
        className="w-full h-full object-cover object-top"
        style={{ minHeight: '100%', display: 'block' }}
      />
    </div>
  )
}
