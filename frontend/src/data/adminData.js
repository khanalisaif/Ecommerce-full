import { CATEGORY_PRODUCTS, bestSellers } from './dummyData'

// Flatten a sample of real catalog products so the admin panel reflects the
// same products that exist on the live storefront.
export const adminProducts = Object.values(CATEGORY_PRODUCTS)
  .flat()
  .slice(0, 60)
  .map((p, idx) => ({
    ...p,
    stock: [0, 4, 12, 28, 56, 120, 340][idx % 7],
    sku: `HTL-${(1000 + idx).toString()}`,
  }))

const customerNames = [
  'Rahul Sharma', 'Priya Verma', 'Amit Singh', 'Sneha Patel', 'Vikram Rao',
  'Ananya Iyer', 'Karan Mehta', 'Divya Nair', 'Arjun Gupta', 'Neha Kapoor',
  'Rohan Das', 'Ishita Bose',
]

export const adminCustomers = customerNames.map((name, i) => ({
  id: `cust-${i + 1}`,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
  phone: `+91 9${(800000000 + i * 137).toString().slice(0, 9)}`,
  orders: [3, 7, 1, 12, 5, 2, 9, 4, 6, 1, 8, 2][i],
  totalSpent: [15499, 42990, 2999, 98450, 21990, 5499, 61230, 8990, 34999, 1999, 55670, 6999][i],
  joined: ['12 Jan 2026', '03 Feb 2026', '22 Feb 2026', '08 Mar 2026', '19 Mar 2026', '02 Apr 2026', '15 Apr 2026', '27 Apr 2026', '10 May 2026', '21 May 2026', '02 Jun 2026', '14 Jun 2026'][i],
  status: i % 5 === 0 ? 'Inactive' : 'Active',
}))

const orderStatuses = ['Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled']

export const adminOrders = Array.from({ length: 18 }).map((_, i) => {
  const product = bestSellers[i % bestSellers.length]
  const customer = adminCustomers[i % adminCustomers.length]
  return {
    id: `ORD-${(20450 + i).toString()}`,
    customerName: customer.name,
    customerEmail: customer.email,
    product: product.name,
    image: product.image,
    amount: product.price,
    status: orderStatuses[i % orderStatuses.length],
    date: `${(i % 28) + 1} Aug 2026`,
  }
})

// Last 7 days revenue trend (for the overview chart)
export const revenueTrend = [
  { day: 'Mon', revenue: 42500 },
  { day: 'Tue', revenue: 38900 },
  { day: 'Wed', revenue: 55200 },
  { day: 'Thu', revenue: 47800 },
  { day: 'Fri', revenue: 61300 },
  { day: 'Sat', revenue: 72400 },
  { day: 'Sun', revenue: 66100 },
]

export const dashboardStats = {
  totalRevenue: adminOrders.reduce((sum, o) => sum + o.amount, 0),
  totalOrders: adminOrders.length,
  totalProducts: adminProducts.length,
  totalCustomers: adminCustomers.length,
}
