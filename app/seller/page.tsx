import { auth } from '@/lib/auth'
import { getClient } from '@/lib/db/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getSellerMetrics(sellerId: string) {
  try {
    const client = getClient()

    const productResult = await client`
      SELECT COUNT(*)::int AS count
      FROM products
      WHERE seller_id = ${sellerId}
    `

    const pendingOrdersResult = await client`
      SELECT COUNT(*)::int AS count
      FROM orders
      WHERE seller_id = ${sellerId} AND status = 'quotation'
    `

    const confirmedResult = await client`
      SELECT
        COUNT(*)::int AS count,
        COALESCE(SUM(total_price_inr), 0)::numeric(12,4) AS revenue
      FROM orders
      WHERE seller_id = ${sellerId} AND status IN ('confirmed', 'completed')
    `

    const productCount = productResult?.[0]?.count ?? 0
    const pendingOrderCount = pendingOrdersResult?.[0]?.count ?? 0
    const confirmedOrderCount = confirmedResult?.[0]?.count ?? 0
    const confirmedRevenue = confirmedResult?.[0]?.revenue ?? '0'

    return {
      productCount,
      pendingOrderCount,
      confirmedOrderCount,
      confirmedRevenue,
    }
  } catch (error) {
    console.error('Seller metrics error:', error)
    return null
  }
}

export default async function SellerPage() {
  const session = await auth()

  if (!session || session.user.role !== 'seller') {
    redirect('/')
  }

  const metrics = await getSellerMetrics(session.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {session.user.name}!</h1>
          <p className="text-gray-600">Seller Dashboard — manage your company catalog and incoming buyer orders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm uppercase tracking-wide text-gray-500">Products listed</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{metrics ? metrics.productCount : '––'}</p>
            <p className="mt-2 text-sm text-gray-600">Total SKUs in your catalog</p>
          </div>

          <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm uppercase tracking-wide text-gray-500">Pending quotations</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{metrics ? metrics.pendingOrderCount : '––'}</p>
            <p className="mt-2 text-sm text-gray-600">New buyer requests awaiting review</p>
          </div>

          <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm uppercase tracking-wide text-gray-500">Confirmed orders</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{metrics ? metrics.confirmedOrderCount : '––'}</p>
            <p className="mt-2 text-sm text-gray-600">Orders approved or completed</p>
          </div>

          <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm uppercase tracking-wide text-gray-500">Revenue earned</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">₹{metrics ? metrics.confirmedRevenue : '––'}</p>
            <p className="mt-2 text-sm text-gray-600">Confirmed sales value in INR</p>
          </div>
        </div>

        {metrics === null ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 mb-8">
            <p className="font-semibold text-amber-900">Seller metrics are unavailable.</p>
            <p className="text-sm text-amber-700">If your database is not configured, these dashboard metrics will appear once your connection is restored.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/seller/products">
            <div className="card hover:shadow-lg transition cursor-pointer p-6">
              <h3 className="text-lg font-semibold mb-2">📦 Product Catalog</h3>
              <p className="text-gray-600 mb-4">View the products you sell and your available stock.</p>
              <div className="text-blue-600 font-semibold">Manage catalog →</div>
            </div>
          </Link>

          <Link href="/seller/orders">
            <div className="card hover:shadow-lg transition cursor-pointer p-6">
              <h3 className="text-lg font-semibold mb-2">📝 Incoming Orders</h3>
              <p className="text-gray-600 mb-4">Review buyer quotations and confirm customer orders.</p>
              <div className="text-green-600 font-semibold">View orders →</div>
            </div>
          </Link>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">🏢 Company Info</h3>
            <p className="text-gray-600 mb-4">Your seller account represents the company selling products to buyers.</p>
            <p className="text-sm text-gray-500">Use this dashboard to keep your product catalog up-to-date and respond to purchase requests.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Seller workflow</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="font-semibold mb-2">1. Publish products</p>
              <p className="text-sm text-gray-600">Add and manage your inventory so buyers can purchase the correct units.</p>
            </div>
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <p className="font-semibold mb-2">2. Receive orders</p>
              <p className="text-sm text-gray-600">Track incoming buyer orders and quotations in your seller orders view.</p>
            </div>
            <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
              <p className="font-semibold mb-2">3. Confirm and supply</p>
              <p className="text-sm text-gray-600">Approve quotations, confirm orders, and manage the fulfillment process.</p>
            </div>
            <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
              <p className="font-semibold mb-2">4. Unit conversions</p>
              <p className="text-sm text-gray-600">Your catalog supports grams, kilograms, milliliters, liters, and item counts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
