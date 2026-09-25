import { useState, useEffect } from 'react'
import {
  X, Clock, PackageCheck, Truck, Home, XCircle, Download,
  ArrowRight, Ban, CheckCircle2, Trash2, Loader2,
  CreditCard, Smartphone, Wallet, Building2, Coins, Package,
  Send, RefreshCw, MapPin, ExternalLink, Scan, Tag,
  Calendar, AlertCircle,
} from 'lucide-react'
import { useShop } from '../../context/ShopContext'
import deliveryService from '../../services/deliveryService'

const PAYMENT_META = {
  online:     { label: 'Razorpay Online',    bg: '#f3e8ff', color: '#7c3aed', Icon: CreditCard },
  razorpay:   { label: 'Razorpay Online',    bg: '#f3e8ff', color: '#7c3aed', Icon: CreditCard },
  upi:        { label: 'UPI Pay',            bg: '#f3e8ff', color: '#7c3aed', Icon: Smartphone },
  cod:        { label: 'Cash on Delivery',   bg: '#fff7ed', color: '#c2410c', Icon: Coins },
  card:       { label: 'Card Payment',       bg: '#eff6ff', color: '#1d4ed8', Icon: CreditCard },
  netbanking: { label: 'Net Banking',        bg: '#ecfeff', color: '#0e7490', Icon: Building2 },
  wallet:     { label: 'Wallet',             bg: '#f0fdf4', color: '#15803d', Icon: Wallet },
}

function PaymentMethodBadge({ method }) {
  const key = method?.toLowerCase()
  const meta = PAYMENT_META[key] || { label: method || 'Unknown', bg: '#f3f4f6', color: '#6b7280', Icon: CreditCard }
  const { label, bg, color, Icon } = meta
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full"
      style={{ background: bg, color }}
    >
      <Icon size={13} />
      {label}
    </span>
  )
}

const STAGE_META = {
  Pending:    { icon: Clock,        label: 'Order Received', color: '#a855f7' },
  Processing: { icon: PackageCheck, label: 'Processing',     color: '#f59e0b' },
  Shipped:    { icon: Truck,        label: 'Shipped',        color: '#3b82f6' },
  Delivered:  { icon: Home,         label: 'Delivered',      color: '#22c55e' },
  Cancelled:  { icon: XCircle,      label: 'Cancelled',      color: '#ef4444' },
}

function formatTimestamp(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// ─── Delhivery Tab ────────────────────────────────────────────────────────────
function DelhiveryPanel({ order }) {
  const {
    confirmOrderWithDelhivery,
    resendOrderToDelhivery,
    cancelOrderOnDelhivery,
    getOrderDelhiveryLabel,
    trackOrderOnDelhivery,
    scheduleDelhiveryPickup,
    showToast,
  } = useShop()

  const del = order.delhivery || {}
  const hasWaybill  = !!del.waybill

  const [loading, setLoading]         = useState('')
  const [trackData, setTrackData]     = useState(null)
  const [labelUrl, setLabelUrl]       = useState(del.labelUrl || '')
  const [showPickup, setShowPickup]   = useState(false)
  const [pickupError, setPickupError] = useState('')
  const [pickup, setPickup]           = useState({
    pickupDate:   new Date().toISOString().slice(0, 10),
    pickupTime:   '16:00',
    packageCount: '1',
  })

  // Delhivery shipping rate & cost estimate (admin-facing)
  const [rateEstimate, setRateEstimate] = useState(null)
  const [rateLoading, setRateLoading]   = useState(false)

  const loadRateEstimate = async () => {
    const pin = order.shippingAddress?.pincode
    if (!pin || String(pin).length !== 6) return
    setRateLoading(true)
    try {
      const res = await deliveryService.getDeliveryInfo(pin, {
        weight: 50,
        mode: 'S',
        payment_type: order.paymentMethod?.toLowerCase() === 'cod' ? 'COD' : 'Prepaid',
      })
      setRateEstimate(res?.data || res)
    } catch {}
    finally {
      setRateLoading(false)
    }
  }

  useEffect(() => {
    loadRateEstimate()
  }, [order.shippingAddress?.pincode])

  const act = async (key, fn, successMsg) => {
    setLoading(key)
    try {
      const data = await fn()
      showToast(successMsg)
      return data
    } catch (err) {
      showToast(err?.message || 'Action failed', 'error')
      throw err
    } finally {
      setLoading('')
    }
  }

  const handleConfirm = () =>
    act('confirm', () => confirmOrderWithDelhivery(order.id), `✅ Shipment created! AWB: ${del.waybill || '...'}`)

  const handleResend = () =>
    act('resend', () => resendOrderToDelhivery(order.id), '✅ Shipment re-created on Delhivery')

  const handleLabel = async () => {
    const data = await act('label', () => getOrderDelhiveryLabel(order.id), '🖨️ Label fetched!')
    if (data?.labelUrl) {
      setLabelUrl(data.labelUrl)
      window.open(data.labelUrl, '_blank')
    }
  }

  const handleCancel = () =>
    act('cancel', () => cancelOrderOnDelhivery(order.id), '🚫 Shipment cancelled on Delhivery')

  const handleTrack = async () => {
    const data = await act('track', () => trackOrderOnDelhivery(order.id), '📡 Tracking data refreshed')
    if (data) setTrackData(data)
  }

  const handleSchedulePickup = async () => {
    setPickupError('')
    try {
      await act('pickup', () =>
        scheduleDelhiveryPickup({
          pickupDate:   pickup.pickupDate,
          pickupTime:   pickup.pickupTime + ':00',
          packageCount: Number(pickup.packageCount),
          orderIds:     [order._id || order.id].filter(Boolean),
        }),
        '🚐 Pickup scheduled with Delhivery!'
      )
      setShowPickup(false)
    } catch (err) {
      setPickupError(err?.message || 'Failed to schedule pickup')
    }
  }

  const Btn = ({ id, onClick, icon: Icon, label, style = 'primary', disabled }) => {
    const isLoading = loading === id
    const baseClass = 'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed'
    const styles = {
      primary:   { className: `${baseClass} text-white`, style: { background: 'linear-gradient(135deg,#a855f7,#ec4899)' } },
      secondary: { className: `${baseClass} text-purple-700 border-2 border-purple-200 hover:bg-purple-50`, style: {} },
      green:     { className: `${baseClass} text-white`, style: { background: 'linear-gradient(135deg,#22c55e,#16a34a)' } },
      orange:    { className: `${baseClass} text-white`, style: { background: 'linear-gradient(135deg,#f97316,#ef4444)' } },
      red:       { className: `${baseClass} text-red-600 border-2 border-red-200 hover:bg-red-50`, style: {} },
      blue:      { className: `${baseClass} text-white`, style: { background: 'linear-gradient(135deg,#3b82f6,#6366f1)' } },
    }
    const s = styles[style] || styles.primary
    return (
      <button
        onClick={onClick}
        disabled={isLoading || disabled}
        className={s.className}
        style={s.style}
      >
        {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
        {isLoading ? 'Please wait...' : label}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* AWB / Status card */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#a855f7,#6366f1)' }}>
            <Package size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Delhivery Shipment</span>
        </div>

        {hasWaybill ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-purple-100">
              <span className="text-xs text-gray-500 font-medium">AWB / Waybill</span>
              <span className="font-mono font-black text-purple-700 text-sm">{del.waybill}</span>
            </div>
            {del.sortCode && (
              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-purple-100">
                <span className="text-xs text-gray-500 font-medium">Sort Code</span>
                <span className="font-mono text-gray-700 text-sm">{del.sortCode}</span>
              </div>
            )}
            {del.shipmentCreatedAt && (
              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-purple-100">
                <span className="text-xs text-gray-500 font-medium">Booked At</span>
                <span className="text-xs text-gray-700">{formatTimestamp(del.shipmentCreatedAt)}</span>
              </div>
            )}
            {del.delhiveryStatus && (
              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-purple-100">
                <span className="text-xs text-gray-500 font-medium">Delhivery Status</span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{del.delhiveryStatus}</span>
              </div>
            )}
            {/* Public tracking link */}
            <a
              href={`https://www.delhivery.com/track-v2/package/${del.waybill}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-blue-200 rounded-lg text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors"
            >
              <ExternalLink size={12} /> Track on Delhivery.com
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              No shipment created yet. Click <strong>Confirm on Delhivery</strong> to generate AWB.
            </p>
          </div>
        )}
      </div>

      {/* Delhivery Freight Rate & Shipping Cost Breakdown (Admin View) */}
      <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/50 border border-amber-200/80 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-amber-600" />
            <span className="text-xs font-bold text-gray-900">Delhivery Shipping Cost</span>
          </div>
          {rateLoading ? (
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Loader2 size={11} className="animate-spin text-amber-500" /> Calculating...
            </span>
          ) : rateEstimate?.shippingCharge ? (
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-sm text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200">
                ₹{Number(rateEstimate.shippingCharge).toFixed(2)}
              </span>
              <button
                onClick={loadRateEstimate}
                title="Refresh rate"
                className="text-gray-400 hover:text-amber-600 p-1 transition-colors"
              >
                <RefreshCw size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={loadRateEstimate}
              className="text-[11px] text-amber-700 font-semibold hover:underline flex items-center gap-1"
            >
              <RefreshCw size={11} /> Calculate Rate
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 text-xs">
          <div>
            <span className="text-[10px] text-gray-500 font-medium block">Destination Pincode</span>
            <span className="font-bold text-gray-800">
              {order.shippingAddress?.pincode || '—'}
              {order.shippingAddress?.city ? ` (${order.shippingAddress.city})` : ''}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-medium block">Expected TAT / Delivery</span>
            <span className="font-bold text-green-700">
              {rateEstimate?.expectedDate || (rateEstimate?.tatDays ? `${rateEstimate.tatDays} days` : '3–5 days')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">Pickup Warehouse</span>
            <span className="font-medium text-gray-700">
              {rateEstimate?.pickupLocation || 'DIGIVAHAN'} ({rateEstimate?.originPincode || '110092'})
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">Payment Collection</span>
            <span className="font-medium text-gray-700 capitalize">
              {order.paymentMethod?.toLowerCase() === 'cod' ? `COD: ₹${order.amount || 0}` : 'Prepaid (₹0 COD)'}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        {/* Step 1 — Confirm / Create shipment */}
        {!hasWaybill && order.status !== 'Cancelled' && (
          <Btn id="confirm" onClick={handleConfirm} icon={Send} label="📦 Confirm on Delhivery (Get AWB)" style="primary" />
        )}

        {/* Re-send (after cancel) */}
        {del.cancelled && order.status !== 'Cancelled' && (
          <Btn id="resend" onClick={handleResend} icon={RefreshCw} label="🔄 Re-create Shipment on Delhivery" style="orange" />
        )}

        {/* Step 2 — Schedule Pickup */}
        {hasWaybill && !del.cancelled && (
          <>
            {!showPickup ? (
              <Btn
                id="pickup-open"
                onClick={() => setShowPickup(true)}
                icon={Calendar}
                label="🚐 Schedule Pickup"
                style="secondary"
              />
            ) : (
              <div className="border border-purple-200 rounded-xl p-3 space-y-2.5 bg-purple-50/40">
                <p className="text-xs font-bold text-gray-700">Schedule Delhivery Pickup</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium mb-1 block">Pickup Date</label>
                    <input
                      type="date"
                      value={pickup.pickupDate}
                      onChange={(e) => setPickup(p => ({ ...p, pickupDate: e.target.value }))}
                      className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium mb-1 block">Pickup Time</label>
                    <input
                      type="time"
                      value={pickup.pickupTime}
                      onChange={(e) => setPickup(p => ({ ...p, pickupTime: e.target.value }))}
                      className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-medium mb-1 block">Package Count</label>
                  <input
                    type="number"
                    min="1"
                    value={pickup.packageCount}
                    onChange={(e) => setPickup(p => ({ ...p, packageCount: e.target.value }))}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {pickupError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 space-y-1">
                    <p className="text-xs font-bold text-red-700 flex items-center gap-1">
                      <AlertCircle size={13} className="shrink-0" /> {pickupError}
                    </p>
                    {pickupError.toLowerCase().includes('wallet balance') && (
                      <p className="text-[11px] text-red-600 leading-relaxed">
                        💡 Delhivery First Mile Pickup request ke liye account wallet me minimum <strong>₹500 balance</strong> hona zaroori hai (current balance negative hai). Please{' '}
                        <a
                          href="https://app.delhivery.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline text-blue-700 hover:text-blue-900"
                        >
                          app.delhivery.com
                        </a>{' '}
                        par login karke wallet recharge karein.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPickup(false)}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading === 'pickup'}
                    onClick={handleSchedulePickup}
                    className="flex-1 py-2 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}
                  >
                    {loading === 'pickup' ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />}
                    Schedule
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 3 — Fetch Label */}
        {hasWaybill && !del.cancelled && (
          <Btn id="label" onClick={handleLabel} icon={Download} label="🖨️ Download Shipping Label (PDF)" style="blue" />
        )}
        {labelUrl && (
          <a
            href={labelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
          >
            <ExternalLink size={11} /> Open Label PDF
          </a>
        )}

        {/* Step 4 — Live Tracking */}
        {hasWaybill && (
          <Btn id="track" onClick={handleTrack} icon={Scan} label="📡 Refresh Live Tracking" style="green" />
        )}

        {/* Tracking scans */}
        {trackData && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto">
            <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Scan size={12} /> Tracking Scans
            </p>
            {trackData.scans?.length > 0 ? (
              <div className="space-y-1.5">
                {trackData.scans
                  .filter((scan, i, arr) => {
                    if (i === 0) return true
                    const prev = arr[i - 1]
                    return (
                      (scan.ScanDetail?.Scan || scan.scan) !==
                        (prev.ScanDetail?.Scan || prev.scan) ||
                      (scan.ScanDetail?.ScannedLocation || scan.location) !==
                        (prev.ScanDetail?.ScannedLocation || prev.location)
                    )
                  })
                  .slice(0, 10)
                  .map((scan, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {scan.ScanDetail?.Scan || scan.scan || '—'}
                      </p>
                      <p className="text-gray-500">
                        {scan.ScanDetail?.ScannedLocation || scan.location || ''} ·{' '}
                        {scan.ScanDetail?.ScanDateTime || scan.time || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No scans available yet.</p>
            )}
            {trackData.publicTrackUrl && (
              <a
                href={trackData.publicTrackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-blue-500 font-semibold mt-2 hover:underline"
              >
                <ExternalLink size={10} /> Full tracking on Delhivery.com
              </a>
            )}
          </div>
        )}

        {/* Step 5 — Cancel on Delhivery */}
        {hasWaybill && !del.cancelled && order.status !== 'Delivered' && (
          <Btn id="cancel" onClick={handleCancel} icon={Ban} label="🚫 Cancel Shipment on Delhivery" style="red" />
        )}
        {del.cancelled && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <XCircle size={13} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700 font-medium">Shipment has been cancelled on Delhivery</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function OrderDetailModal({ order, onClose }) {
  const { updateOrderStatus, updatePaymentStatus, deleteOrder, showToast } = useShop()
  const [tab, setTab]                   = useState('actions')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting]     = useState(false)

  const history = order.statusHistory || []

  const handleDeleteOrder = async () => {
    setIsDeleting(true)
    try {
      await deleteOrder(order.id)
      onClose()
    } catch {
      setIsDeleting(false)
    }
  }

  const TABS = [
    { id: 'actions',  label: 'Manage Order' },
    { id: 'timeline', label: 'Timeline' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{order.id}</h3>
            <p className="text-gray-500 text-sm">
              {order.customerName} · ₹{(order.amount || 0).toLocaleString('en-IN')}
              {order.delhivery?.waybill && (
                <span className="ml-2 text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  AWB: {order.delhivery.waybill}
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>

        {/* Progress Stepper */}
        <div className="px-6 pt-5 pb-2">
          {order.status === 'Cancelled' ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <XCircle size={16} className="text-red-500" />
              <span className="text-red-700 text-sm font-semibold">This order was cancelled</span>
            </div>
          ) : (
            <div className="flex items-center">
              {['Pending', 'Processing', 'Shipped', 'Delivered'].map((stage, idx, arr) => {
                const stageIdx = ['Pending', 'Processing', 'Shipped', 'Delivered'].indexOf(order.status)
                const isDone    = idx < stageIdx
                const isCurrent = idx === stageIdx
                const meta = STAGE_META[stage]
                const Icon = meta.icon
                return (
                  <div key={stage} className={`flex items-center ${idx < arr.length - 1 ? 'flex-1' : ''}`}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
                        style={{ background: isDone || isCurrent ? meta.color : '#e5e7eb' }}
                      >
                        <Icon size={14} className={isDone || isCurrent ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <span className={`text-[10px] font-semibold text-center ${isCurrent ? 'text-gray-900' : isDone ? 'text-gray-500' : 'text-gray-300'}`}>
                        {stage}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 mb-4" style={{ background: isDone ? meta.color : '#e5e7eb' }} />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors border-b-2 ${
                tab === t.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="border-b border-gray-100" />

        {/* Content */}
        <div className="p-6">
          {/* ─── Timeline Tab ─── */}
          {tab === 'timeline' && (
            <div className="space-y-0">
              {history.map((h, idx) => {
                const meta = STAGE_META[h.status] || STAGE_META.Pending
                const Icon = meta.icon
                const isLast = idx === history.length - 1
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: meta.color }}>
                        <Icon size={16} className="text-white" />
                      </div>
                      {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" style={{ minHeight: 28 }} />}
                    </div>
                    <div className={isLast ? 'pb-1' : 'pb-7'}>
                      <p className="font-semibold text-gray-900 text-sm">{meta.label}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{formatTimestamp(h.timestamp)}</p>
                    </div>
                  </div>
                )
              })}
              {!history.length && <p className="text-gray-400 text-sm text-center py-6">No history available</p>}
            </div>
          )}

          {/* ─── Manage Tab ─── */}
          {tab === 'actions' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-500 text-sm">Current status:</span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                  style={{ background: (STAGE_META[order.status] || STAGE_META.Pending).color }}
                >
                  {order.status}
                </span>
              </div>

              {/* Customer Details */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Customer Details</h4>
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-700"><span className="font-semibold text-gray-500 mr-2">Name:</span>{order.customerName}</p>
                  <p className="text-sm text-gray-700"><span className="font-semibold text-gray-500 mr-2">Email:</span>{order.customerEmail}</p>
                  <p className="text-sm text-gray-700"><span className="font-semibold text-gray-500 mr-2">Phone:</span>{order.customerMobile || '—'}</p>
                  <p className="text-sm text-gray-700"><span className="font-semibold text-gray-500 mr-2">Address:</span>{order.address || '—'}</p>
                  {order.shippingAddress?.pincode && (
                    <p className="text-sm text-gray-700"><span className="font-semibold text-gray-500 mr-2">Pincode:</span>{order.shippingAddress.pincode}</p>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900">Payment Method</h4>
                  <PaymentMethodBadge method={order.paymentMethod} />
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <p className="text-xs text-gray-500 w-full mb-1 font-medium">Payment Status:</p>
                  {['pending', 'paid', 'failed', 'refunded'].map((s) => (
                    <button
                      key={s}
                      onClick={() => { updatePaymentStatus(order.id, s); showToast(`Payment marked as ${s}`) }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                        order.paymentStatus === s
                          ? s === 'paid' ? 'bg-green-500 text-white' : s === 'failed' ? 'bg-red-500 text-white' : s === 'refunded' ? 'bg-gray-500 text-white' : 'bg-amber-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {order.razorpayPaymentId && (
                  <div className="pt-3 border-t border-gray-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Razorpay Payment ID:</span>
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">{order.razorpayPaymentId}</span>
                    </div>
                    {order.razorpayOrderId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Razorpay Order ID:</span>
                        <span className="font-mono text-gray-600">{order.razorpayOrderId}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Paid Amount:</span>
                      <span className="font-bold text-green-600 text-sm">₹{(order.amount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5"><Package size={14} /> Order Items ({order.items.length})</h4>
                  <div className="space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        {item.image && <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-200 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-gray-800">₹{(item.price || 0).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-400">×{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-2 space-y-1">
                    {order.subtotal != null && <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>₹{(order.subtotal || 0).toLocaleString('en-IN')}</span></div>}
                    {order.discount > 0 && <div className="flex justify-between text-xs text-green-600"><span>Discount</span><span>− ₹{order.discount.toLocaleString('en-IN')}</span></div>}
                    {order.couponDiscount > 0 && <div className="flex justify-between text-xs text-green-600"><span>Coupon ({order.couponCode})</span><span>− ₹{order.couponDiscount.toLocaleString('en-IN')}</span></div>}
                    {order.shippingCost != null && <div className="flex justify-between text-xs text-gray-500"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost.toLocaleString('en-IN')}`}</span></div>}
                    <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-1 mt-1"><span>Total Paid</span><span>₹{(order.amount || 0).toLocaleString('en-IN')}</span></div>
                  </div>
                </div>
              )}

              {/* ── Delhivery Fulfillment & Shipping Operations ── */}
              <div className="pt-2 border-t border-gray-100">
                <DelhiveryPanel order={order} />
              </div>

              {/* Delete */}
              <div className="pt-3 border-t border-gray-100">
                {!deleteConfirm ? (
                  <button type="button" onClick={() => setDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors cursor-pointer">
                    <Trash2 size={16} /> Delete Order
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <p className="text-red-800 text-sm font-semibold">Are you sure you want to permanently delete this order ({order.id})?</p>
                    <div className="flex gap-2">
                      <button type="button" disabled={isDeleting} onClick={() => setDeleteConfirm(false)} className="flex-1 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 cursor-pointer">
                        Keep Order
                      </button>
                      <button type="button" disabled={isDeleting} onClick={handleDeleteOrder} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
