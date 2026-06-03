import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BuyerDashboardPage() {
  const session = await auth()

  if (!session || !session.user || session.user.role !== 'buyer') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Browse products and place orders for the chemicals you need.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/buyer/products" className="card border border-blue-200 bg-white p-6 rounded-lg shadow-sm hover:border-blue-300 transition">
            <h2 className="text-2xl font-semibold mb-2">Browse Products</h2>
            <p className="text-gray-600">See available products and buy using flexible unit conversion.</p>
          </Link>

          <Link href="/buyer/orders" className="card border border-green-200 bg-white p-6 rounded-lg shadow-sm hover:border-green-300 transition">
            <h2 className="text-2xl font-semibold mb-2">My Orders</h2>
            <p className="text-gray-600">View your purchase history, order status, and details.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
