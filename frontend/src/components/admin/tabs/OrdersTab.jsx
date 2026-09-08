import { useEffect, useState } from 'react'
import { ChevronRight, Trash2, AlertTriangle, Loader2, ShoppingBag, Clock, Loader, Truck, CheckCircle, XCircle } from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import Pagination from '../Pagination'
import OrderDetailModal from '../OrderDetailModal'

const statusStyles = {
  Delivered: 'bg-green-100 text-green-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Processing: 'bg-amber-100 text-amber-700',
  Pending: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
}

const filters = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const PER_PAGE = 8

export default function OrdersTab() {
  const { orders, deleteOrder } = useShop()
  const [activeFilter, setActiveFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [isDeletingOrder, setIsDeletingOrder] = useState(false)

  const allCount = orders.length
  const pendingCount = orders.filter((o) => o.status === 'Pending').length
  const processingCount = orders.filter((o) => o.status === 'Processing').length
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length

  const statCards = [
    { label: 'Total Orders', value: allCount, icon: ShoppingBag, color: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' },
    { label: 'Processing', value: processingCount, icon: Loader, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { label: 'Shipped', value: shippedCount, icon: Truck, color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { label: 'Delivered', value: deliveredCount, icon: CheckCircle, color: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
    { label: 'Cancelled', value: cancelledCount, icon: XCircle, color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  ]

  const filtered =
    activeFilter === 'All' ? orders : orders.filter((o) => o.status === activeFilter)

  useEffect(() => { setCurrentPage(1) }, [activeFilter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  // Keep the open modal's order data fresh after a status change
  const liveSelectedOrder = selectedOrder ? orders.find((o) => o.id === selectedOrder.id) : null

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return
    setIsDeletingOrder(true)
    try {
      await deleteOrder(orderToDelete.id)
      setOrderToDelete(null)
    } finally {
      setIsDeletingOrder(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: color }}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-gray-500 text-xs font-medium">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Orders <span className="text-gray-400 font-medium">({filtered.length})</span></h3>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  activeFilter === f
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={activeFilter === f ? { background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' } : {}}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-5 sm:px-6 py-3 font-semibold">Order ID</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Customer</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Product</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Date</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Amount</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Status</th>
                <th className="px-5 sm:px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="border-t border-gray-50 hover:bg-purple-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-5 sm:px-6 py-3 font-semibold text-gray-700">{o.id}</td>
                  <td className="px-5 sm:px-6 py-3">
                    <p className="text-gray-700 font-medium">{o.customerName}</p>
                    <p className="text-gray-500 text-sm">{o.customerEmail}</p>
                  </td>
                  <td className="px-5 sm:px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={o.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100" />
                      <span className="text-gray-600 max-w-[160px] truncate">{o.product}</span>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3 text-gray-500">{o.date}</td>
                  <td className="px-5 sm:px-6 py-3 font-semibold text-gray-800">₹{(o.amount ?? 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 sm:px-6 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 sm:px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="Delete Order"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOrderToDelete(o)
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </td>
                </tr>
              ))}
              {!paginated.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400 text-sm">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {liveSelectedOrder && (
        <OrderDetailModal order={liveSelectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {/* Delete Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !isDeletingOrder && setOrderToDelete(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Delete Order</h4>
                <p className="text-gray-500 text-xs">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm">
              Are you sure you want to permanently delete order <span className="font-bold text-gray-900">{orderToDelete.id}</span> ({orderToDelete.customerName} - ₹{(orderToDelete.amount ?? 0).toLocaleString('en-IN')})?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingOrder ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeletingOrder ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
