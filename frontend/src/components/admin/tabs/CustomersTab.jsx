import { useEffect, useState } from 'react'
import { Search, ChevronRight, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import Pagination from '../Pagination'
import CustomerDetailModal from '../CustomerDetailModal'
import { useShop } from '../../../context/ShopContext'
import adminCustomerService from '../../../services/admin/adminCustomerService'

const PER_PAGE = 8

export default function CustomersTab() {
  const { orders, showToast } = useShop()
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    adminCustomerService
      .getAllCustomers({ search: query, page: 1, limit: 500 })
      .then((res) => {
        const mapped = (res.data.customers || []).map((c) => {
          const customerOrders = orders.filter((o) => o.customerEmail === c.email)
          return {
            id: c._id,
            name: c.fullName,
            email: c.email,
            phone: c.mobileNumber,
            orders: customerOrders.length,
            totalSpent: customerOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
            joined: new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: c.isActive ? 'Active' : 'Inactive',
          }
        })
        setCustomers(mapped)
      })
      .catch(() => setCustomers([]))
      .finally(() => setIsLoading(false))
  }, [query, orders])

  useEffect(() => { setCurrentPage(1) }, [query])

  const totalPages = Math.ceil(customers.length / PER_PAGE)
  const paginated = customers.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages)
  }, [totalPages, currentPage])

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return
    setIsDeleting(true)
    try {
      await adminCustomerService.deleteCustomer(customerToDelete.id)
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id))
      showToast('Customer deleted successfully')
      setCustomerToDelete(null)
    } catch (err) {
      showToast(err.message || 'Failed to delete customer', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            Customers <span className="text-gray-400 font-medium">({customers.length})</span>
          </h3>
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-5 sm:px-6 py-3 font-semibold">Customer</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Phone</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Orders</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Total Spent</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Joined</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Status</th>
                <th className="px-5 sm:px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400"><Loader2 className="animate-spin inline" size={18} /></td></tr>
              )}
              {!isLoading && paginated.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="border-t border-gray-50 hover:bg-purple-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-5 sm:px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                      >
                        {c.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{c.name}</p>
                        <p className="text-gray-500 text-sm">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-5 sm:px-6 py-3 text-gray-700 font-semibold">{c.orders}</td>
                  <td className="px-5 sm:px-6 py-3 text-gray-800 font-semibold">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                  <td className="px-5 sm:px-6 py-3 text-gray-500">{c.joined}</td>
                  <td className="px-5 sm:px-6 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 sm:px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="Delete Customer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCustomerToDelete(c)
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
              {!isLoading && !paginated.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400 text-sm">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onStatusChange={(id, newStatus) => {
            setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)))
          }}
          onDeleteCustomer={(id) => {
            setCustomers((prev) => prev.filter((c) => c.id !== id))
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !isDeleting && setCustomerToDelete(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Delete Customer</h4>
                <p className="text-gray-500 text-xs">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm">
              Are you sure you want to permanently delete customer <span className="font-bold text-gray-900">{customerToDelete.name}</span> ({customerToDelete.email})?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCustomerToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeleting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
