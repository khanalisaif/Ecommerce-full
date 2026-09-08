import { useState } from 'react'
import {
  X, Clock, PackageCheck, Truck, Home, XCircle, Download,
  ArrowRight, Ban, CheckCircle2, Trash2, Loader2,
} from 'lucide-react'
import { useShop } from '../../context/ShopContext'

const STAGE_META = {
  Pending:    { icon: Clock,        label: 'Order Received',  color: '#a855f7' },
  Processing: { icon: PackageCheck, label: 'Processing',      color: '#f59e0b' },
  Shipped:    { icon: Truck,        label: 'Shipped',         color: '#3b82f6' },
  Delivered:  { icon: Home,         label: 'Delivered',       color: '#22c55e' },
  Cancelled:  { icon: XCircle,      label: 'Cancelled',       color: '#ef4444' },
}

function formatTimestamp(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function downloadShippingLabel(order) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Shipping Label - ${order.id}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 24px; background: #f3f4f6; }
  .label { max-width: 420px; margin: 0 auto; background: white; border: 2px solid #111; border-radius: 12px; padding: 20px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #111; padding-bottom: 12px; margin-bottom: 12px; }
  .brand { font-weight: 900; font-size: 18px; letter-spacing: 1px; }
  .order-id { font-weight: 700; font-size: 13px; background: #111; color: white; padding: 4px 10px; border-radius: 6px; }
  .section { margin-bottom: 14px; }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: 700; margin-bottom: 4px; }
  .section-value { font-size: 15px; font-weight: 700; color: #111; }
  .section-sub { font-size: 12px; color: #555; }
  .barcode { display: flex; gap: 2px; align-items: flex-end; height: 50px; margin: 14px 0; }
  .barcode div { background: #111; width: 3px; }
  .footer-row { display: flex; justify-content: space-between; border-top: 2px dashed #111; padding-top: 10px; font-size: 12px; }
</style>
</head>
<body>
  <div class="label">
    <div class="header">
      <span class="brand">HASHTELICOM</span>
      <span class="order-id">${order.id}</span>
    </div>
    <div class="section">
      <div class="section-label">Ship To</div>
      <div class="section-value">${order.customerName}</div>
      <div class="section-sub">${order.customerEmail}</div>
    </div>
    <div class="section">
      <div class="section-label">Item</div>
      <div class="section-value">${order.product}</div>
      <div class="section-sub">Order amount: ₹${order.amount.toLocaleString('en-IN')}</div>
    </div>
    <div class="barcode">
      ${Array.from({ length: 46 }).map(() => `<div style="height:${20 + Math.round(Math.random() * 30)}px"></div>`).join('')}
    </div>
    <div class="footer-row">
      <span>Order Date: ${order.date}</span>
      <span>Label Generated: ${new Date().toLocaleDateString('en-IN')}</span>
    </div>
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Shipping-Label-${order.id}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function OrderDetailModal({ order, onClose }) {
  const { updateOrderStatus, updatePaymentStatus, deleteOrder, showToast } = useShop()
  const [tab, setTab] = useState('timeline')
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const history = order.statusHistory || []
  const isTerminal = order.status === 'Delivered' || order.status === 'Cancelled'

  const handleAction = (newStatus, message) => {
    updateOrderStatus(order.id, newStatus)
    showToast(message)
  }

  const handleDownloadLabel = () => {
    downloadShippingLabel(order)
    showToast('Shipping label downloaded')
  }

  const handleDeleteOrder = async () => {
    setIsDeleting(true)
    try {
      await deleteOrder(order.id)
      onClose()
    } catch {
      setIsDeleting(false)
    }
  }

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
            <p className="text-gray-500 text-sm">{order.customerName} · ₹{order.amount.toLocaleString('en-IN')}</p>
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
                const isDone = idx < stageIdx
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
          {[
            { id: 'timeline', label: 'Order Timeline' },
            { id: 'actions', label: 'Manage Order' },
          ].map((t) => (
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
          {tab === 'timeline' && (
            <div className="space-y-0">
              {history.map((h, idx) => {
                const meta = STAGE_META[h.status] || STAGE_META.Pending
                const Icon = meta.icon
                const isLast = idx === history.length - 1
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: meta.color }}
                      >
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

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Customer Details</h4>
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-700"><span className="font-semibold text-gray-500 mr-2">Name:</span> {order.customerName}</p>
                  <p className="text-sm text-gray-700"><span className="font-semibold text-gray-500 mr-2">Email:</span> {order.customerEmail}</p>
                  <p className="text-sm text-gray-700"><span className="font-semibold text-gray-500 mr-2">Address:</span> {order.address || '45, MG Road, Block C, Indiranagar, Bengaluru, Karnataka 560038'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900">Payment</h4>
                  <span className="text-xs font-semibold text-gray-500 uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
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
              </div>

              {isTerminal ? (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-4 text-gray-500 text-sm">
                  <CheckCircle2 size={16} />
                  This order is {order.status.toLowerCase()} — no further actions available.
                </div>
              ) : (
                <div className="space-y-3">
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => handleAction('Processing', 'Order moved to Processing')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                    >
                      <ArrowRight size={16} /> Mark as Processing
                    </button>
                  )}

                  {order.status === 'Processing' && (
                    <>
                      <button
                        onClick={handleDownloadLabel}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-purple-200 text-purple-700 font-bold text-sm hover:bg-purple-50 transition-colors"
                      >
                        <Download size={16} /> Download Shipping Label
                      </button>
                      <button
                        onClick={() => handleAction('Shipped', 'Order marked as Shipped')}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                      >
                        <Truck size={16} /> Mark as Shipped
                      </button>
                    </>
                  )}

                  {order.status === 'Shipped' && (
                    <button
                      onClick={() => handleAction('Delivered', 'Order marked as Delivered')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                    >
                      <Home size={16} /> Mark as Delivered
                    </button>
                  )}

                  {!cancelConfirm ? (
                    <button
                      onClick={() => setCancelConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
                    >
                      <Ban size={16} /> Cancel Order
                    </button>
                  ) : (
                    <div className="border-2 border-red-200 rounded-xl p-4 space-y-3">
                      <p className="text-red-700 text-sm font-semibold">Are you sure you want to cancel this order?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCancelConfirm(false)}
                          className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50"
                        >
                          Keep Order
                        </button>
                        <button
                          onClick={() => { handleAction('Cancelled', 'Order cancelled'); setCancelConfirm(false) }}
                          className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600"
                        >
                          Yes, Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Order Section */}
              <div className="pt-3 border-t border-gray-100">
                {!deleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} /> Delete Order
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <p className="text-red-800 text-sm font-semibold">
                      Are you sure you want to permanently delete this order ({order.id})? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => setDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                      >
                        Keep Order
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDeleteOrder}
                        className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
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
