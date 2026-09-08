import { useEffect, useState } from 'react'
import { IndianRupee, ShoppingBag, Package, Users, TrendingUp } from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import adminDashboardService from '../../../services/admin/adminDashboardService'

const statusStyles = {
  Delivered: 'bg-green-100 text-green-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Processing: 'bg-amber-100 text-amber-700',
  Pending: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
}

const statCards = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: IndianRupee, prefix: '₹', format: (v) => v.toLocaleString('en-IN') },
  { key: 'totalOrders', label: 'Total Orders', icon: ShoppingBag },
  { key: 'totalProducts', label: 'Total Products', icon: Package },
  { key: 'totalCustomers', label: 'Total Customers', icon: Users },
]

export default function OverviewTab() {
  const { products, orders } = useShop()
  const [overview, setOverview] = useState({ totalRevenue: 0, totalCustomers: 0 })

  useEffect(() => {
    adminDashboardService.getOverview().then((res) => setOverview(res.data)).catch(() => {})
  }, [])

  const liveStats = {
    totalRevenue: overview.totalRevenue || 0,
    totalCustomers: overview.totalCustomers || 0,
    totalProducts: products.length,
    totalOrders: orders.length,
  }

  // Revenue by day, derived from the real orders list (most recent 7 distinct dates)
  const revenueByDate = orders.reduce((acc, o) => {
    acc[o.date] = (acc[o.date] || 0) + (o.amount || 0)
    return acc
  }, {})
  const revenueTrend = Object.entries(revenueByDate)
    .map(([day, revenue]) => ({ day, revenue, ts: new Date(day).getTime() }))
    .sort((a, b) => a.ts - b.ts)
    .slice(-7)
    .map(({ day, revenue }) => {
      const shortDay = day.split(' ').slice(0, 2).join(' ') // e.g. "04 Jul"
      return { day: shortDay, fullDate: day, revenue }
    })
  const maxRevenue = Math.max(1, ...revenueTrend.map((d) => d.revenue))

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, prefix, format }) => (
          <div key={key} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
              >
                <Icon size={18} className="text-white" />
              </div>
              <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                <TrendingUp size={13} />
              </span>
            </div>
            <p className="text-gray-500 text-xs font-medium">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {prefix || ''}{format ? format(liveStats[key]) : liveStats[key]}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart + order status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Revenue — Recent Days</h3>
              <p className="text-gray-500 text-sm mt-0.5">Daily revenue trend from real orders</p>
            </div>
          </div>
          {revenueTrend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
          ) : (
            <div className="flex items-end justify-between gap-1 sm:gap-4 h-48">
              {revenueTrend.map((d) => (
                <div key={d.fullDate} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-40">
                    <div
                      className="w-full max-w-[36px] rounded-t-lg transition-all"
                      style={{
                        height: `${(d.revenue / maxRevenue) * 100}%`,
                        background: 'linear-gradient(180deg, #c084fc 0%, #a855f7 60%, #ec4899 100%)',
                      }}
                      title={`${d.fullDate}: ₹${d.revenue.toLocaleString('en-IN')}`}
                    />
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium whitespace-nowrap">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            {Object.entries(
              orders.reduce((acc, o) => {
                acc[o.status] = (acc[o.status] || 0) + 1
                return acc
              }, {})
            ).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[status]}`}>
                  {status}
                </span>
                <span className="text-sm font-bold text-gray-700">{count}</span>
              </div>
            ))}
            {orders.length === 0 && <p className="text-gray-400 text-sm">No orders yet</p>}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-5 sm:px-6 py-3 font-semibold">Order ID</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Customer</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Product</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Amount</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50/70">
                  <td className="px-5 sm:px-6 py-3 font-semibold text-gray-700">{o.id}</td>
                  <td className="px-5 sm:px-6 py-3 text-gray-600">{o.customerName}</td>
                  <td className="px-5 sm:px-6 py-3 text-gray-600">{o.product}</td>
                  <td className="px-5 sm:px-6 py-3 font-semibold text-gray-800">₹{(o.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 sm:px-6 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
