import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, GalleryHorizontal, LayoutGrid, Layers, Megaphone, Sparkles, Check } from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import BannerFormModal from '../BannerFormModal'
import CollectionFormModal from '../CollectionFormModal'
import CategoryCardFormModal from '../CategoryCardFormModal'
import FeatureBannerFormModal from '../FeatureBannerFormModal'
import HeroProductSelectModal from '../HeroProductSelectModal'

function Section({ icon: Icon, title, subtitle, onAdd, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-gray-500 text-sm">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap transition-all hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
        >
          <Plus size={15} /> Add
        </button>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  )
}

function Row({ image, title, subtitle, idx, total, onUp, onDown, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-5 sm:px-6 py-3">
      <div className="flex flex-col">
        <button disabled={idx === 0} onClick={onUp} className="text-gray-300 hover:text-purple-600 disabled:opacity-30"><ChevronUp size={13} /></button>
        <button disabled={idx === total - 1} onClick={onDown} className="text-gray-300 hover:text-purple-600 disabled:opacity-30"><ChevronDown size={13} /></button>
      </div>
      <img src={image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
        <p className="text-gray-500 text-sm truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"><Pencil size={14} /></button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
      </div>
    </div>
  )
}

export default function HomepageTab() {
  const {
    banners, addBanner, updateBanner, deleteBanner, reorderBanner,
    collections, addCollection, updateCollection, deleteCollection, reorderCollection,
    categoryCards, addCategoryCard, updateCategoryCard, deleteCategoryCard, reorderCategoryCard,
    featureBanners, addFeatureBanner, updateFeatureBanner, deleteFeatureBanner, reorderFeatureBanner,
    products, categories,
    heroProductBanner, updateHeroProductBanner, deleteHeroProductBanner,
    showToast,
  } = useShop()

  const [bannerModal, setBannerModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [collectionModal, setCollectionModal] = useState(false)
  const [editingCollection, setEditingCollection] = useState(null)
  const [cardModal, setCardModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [featureModal, setFeatureModal] = useState(false)
  const [editingFeature, setEditingFeature] = useState(null)
  const [heroModal, setHeroModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // { type, item }

  // Resolve live product details for hero product if present
  const liveHeroProduct = heroProductBanner?.productId
    ? (products.find((p) => String(p.id) === String(heroProductBanner.productId)) || heroProductBanner)
    : heroProductBanner

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start w-full">
      <Section icon={GalleryHorizontal} title="Hero Banners" subtitle="Rotating carousel at the top of the homepage" onAdd={() => { setEditingBanner(null); setBannerModal(true) }}>
        {banners.map((b, idx) => (
          <Row key={b.id} image={b.image} title={b.title} subtitle={b.subtitle}
            idx={idx} total={banners.length}
            onUp={() => reorderBanner(b.id, 'up')} onDown={() => reorderBanner(b.id, 'down')}
            onEdit={() => { setEditingBanner(b); setBannerModal(true) }}
            onDelete={() => setDeleteTarget({ type: 'banner', item: b })} />
        ))}
        {!banners.length && <div className="px-6 py-8 text-center text-gray-400 text-sm">No banners yet</div>}
      </Section>

      <Section icon={LayoutGrid} title="Category Cards" subtitle="The 5-column image grid below the hero banner" onAdd={() => { setEditingCollection(null); setCollectionModal(true) }}>
        {collections.map((c, idx) => (
          <Row key={c.id} image={c.image} title={c.name} subtitle={c.subtitle}
            idx={idx} total={collections.length}
            onUp={() => reorderCollection(c.id, 'up')} onDown={() => reorderCollection(c.id, 'down')}
            onEdit={() => { setEditingCollection(c); setCollectionModal(true) }}
            onDelete={() => setDeleteTarget({ type: 'collection', item: c })} />
        ))}
        {!collections.length && <div className="px-6 py-8 text-center text-gray-400 text-sm">No collections yet</div>}
      </Section>

      <Section icon={Layers} title="Sub Category Cards" subtitle="The large feature cards further down the homepage" onAdd={() => { setEditingCard(null); setCardModal(true) }}>
        {categoryCards.map((c, idx) => (
          <Row key={c.id} image={c.image} title={c.name} subtitle={`${c.subtitle || ''}${c.subcategory ? ` • Subcategory: ${c.subcategory}` : ''}`}
            idx={idx} total={categoryCards.length}
            onUp={() => reorderCategoryCard(c.id, 'up')} onDown={() => reorderCategoryCard(c.id, 'down')}
            onEdit={() => { setEditingCard(c); setCardModal(true) }}
            onDelete={() => setDeleteTarget({ type: 'card', item: c })} />
        ))}
        {!categoryCards.length && <div className="px-6 py-8 text-center text-gray-400 text-sm">No category cards yet</div>}
      </Section>

      <Section
        icon={Sparkles}
        title="Hero Product Banner"
        subtitle="Spotlight product banner shown directly above the Feature Banner"
        onAdd={() => setHeroModal(true)}
      >
        {liveHeroProduct ? (
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-purple-50/40 rounded-xl m-4 border border-purple-100">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 shrink-0 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                <img
                  src={liveHeroProduct.image}
                  alt={liveHeroProduct.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Active Spotlight
                  </span>
                  {liveHeroProduct.category && (
                    <span className="text-gray-400 text-xs font-medium truncate">
                      • {liveHeroProduct.category}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                  {liveHeroProduct.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-black text-gray-900 text-sm">
                    ₹{liveHeroProduct.price?.toLocaleString()}
                  </span>
                  {liveHeroProduct.originalPrice > liveHeroProduct.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{liveHeroProduct.originalPrice?.toLocaleString()}
                    </span>
                  )}
                  {liveHeroProduct.discount && (
                    <span className="text-xs font-bold text-green-600">
                      {liveHeroProduct.discount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => setHeroModal(true)}
                className="px-3.5 py-1.5 rounded-lg border border-purple-200 bg-white text-purple-700 hover:bg-purple-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Change Product
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget({ type: 'hero_product', item: liveHeroProduct })}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Remove Hero Product"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            <p className="mb-2">No hero product selected.</p>
            <button
              type="button"
              onClick={() => setHeroModal(true)}
              className="text-xs font-bold text-purple-600 hover:underline"
            >
              + Select a product category-wise to spotlight
            </button>
          </div>
        )}
      </Section>

      <Section icon={Megaphone} title="Feature Banner" subtitle="Full-width dark promo strip with two badges" onAdd={() => { setEditingFeature(null); setFeatureModal(true) }}>
        {featureBanners.map((fb, idx) => (
          <Row key={fb.id} image={fb.image} title={fb.title} subtitle={fb.subtitle?.replace(/\n/g, ' ')}
            idx={idx} total={featureBanners.length}
            onUp={() => reorderFeatureBanner(fb.id, 'up')} onDown={() => reorderFeatureBanner(fb.id, 'down')}
            onEdit={() => { setEditingFeature(fb); setFeatureModal(true) }}
            onDelete={() => setDeleteTarget({ type: 'feature', item: fb })} />
        ))}
        {!featureBanners.length && <div className="px-6 py-8 text-center text-gray-400 text-sm">No feature banner yet</div>}
      </Section>

      {bannerModal && (
        <BannerFormModal
          banner={editingBanner}
          onClose={() => { setBannerModal(false); setEditingBanner(null) }}
          onSave={(data) => {
            editingBanner ? updateBanner(editingBanner.id, data) : addBanner(data)
            showToast(editingBanner ? 'Banner updated' : 'Banner added')
            setBannerModal(false); setEditingBanner(null)
          }}
        />
      )}
      {collectionModal && (
        <CollectionFormModal
          collection={editingCollection}
          onClose={() => { setCollectionModal(false); setEditingCollection(null) }}
          onSave={(data) => {
            editingCollection ? updateCollection(editingCollection.id, data) : addCollection(data)
            showToast(editingCollection ? 'Collection updated' : 'Collection added')
            setCollectionModal(false); setEditingCollection(null)
          }}
        />
      )}
      {cardModal && (
        <CategoryCardFormModal
          card={editingCard}
          onClose={() => { setCardModal(false); setEditingCard(null) }}
          onSave={(data) => {
            editingCard ? updateCategoryCard(editingCard.id, data) : addCategoryCard(data)
            showToast(editingCard ? 'Category card updated' : 'Category card added')
            setCardModal(false); setEditingCard(null)
          }}
        />
      )}
      {featureModal && (
        <FeatureBannerFormModal
          banner={editingFeature}
          onClose={() => { setFeatureModal(false); setEditingFeature(null) }}
          onSave={(data) => {
            editingFeature ? updateFeatureBanner(editingFeature.id, data) : addFeatureBanner(data)
            showToast(editingFeature ? 'Feature banner updated' : 'Feature banner added')
            setFeatureModal(false); setEditingFeature(null)
          }}
        />
      )}

      {heroModal && (
        <HeroProductSelectModal
          products={products}
          categories={categories}
          selectedProductId={heroProductBanner?.productId || heroProductBanner?.id}
          onClose={() => setHeroModal(false)}
          onSelect={(selectedProduct) => {
            updateHeroProductBanner({
              productId: selectedProduct.id,
              name: selectedProduct.name,
              category: selectedProduct.category,
              price: selectedProduct.price,
              originalPrice: selectedProduct.originalPrice,
              discount: selectedProduct.discount,
              rating: selectedProduct.rating,
              reviews: selectedProduct.reviews,
              image: selectedProduct.image,
              description: selectedProduct.description,
              badge: selectedProduct.badge || 'Hero Spotlight',
              brand: selectedProduct.brand_name || selectedProduct.brand || '',
            })
            showToast(`"${selectedProduct.name}" set as Hero Product Banner!`)
            setHeroModal(false)
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete this item?</h3>
            <p className="text-gray-500 text-sm mb-6">This will be removed from the homepage.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => {
                  const { type, item } = deleteTarget
                  if (type === 'banner') deleteBanner(item.id)
                  if (type === 'collection') deleteCollection(item.id)
                  if (type === 'card') deleteCategoryCard(item.id)
                  if (type === 'feature') deleteFeatureBanner(item.id)
                  if (type === 'hero_product') deleteHeroProductBanner()
                  showToast('Deleted')
                  setDeleteTarget(null)
                }}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
