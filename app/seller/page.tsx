import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SellerPage() {
  const session = await auth()

  if (!session || session.user.role !== 'seller') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {session.user.name}!</h1>
          <p className="text-gray-600">Seller Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/seller/products">
            <div className="card hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">🛒 Browse Products</h3>
              <p className="text-gray-600 mb-4">Search, filter, and select products</p>
              <div className="text-blue-600 font-semibold">Browse →</div>
            </div>
          </Link>

          <Link href="/seller/orders">
            <div className="card hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">📦 My Orders</h3>
              <p className="text-gray-600 mb-4">View quotations and order history</p>
              <div className="text-green-600 font-semibold">View →</div>
            </div>
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Quick Start Guide</h2>
          <ol className="space-y-2 text-blue-800 text-sm">
            <li>
              <strong>1. Browse Products:</strong> Click "Browse Products" to see available items
            </li>
            <li>
              <strong>2. Select & Configure:</strong> Choose products, enter quantities in your preferred units
            </li>
            <li>
              <strong>3. Real-time Pricing:</strong> See automatic price calculations based on your selections
            </li>
            <li>
              <strong>4. Place Order:</strong> Review and submit your quotation or order
            </li>
            <li>
              <strong>5. Track Status:</strong> Monitor order approval and completion in "My Orders"
            </li>
          </ol>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-2">💡 Unit Support</h3>
            <p className="text-sm text-gray-600">
              Order in any unit: grams, kilograms, milliliters, liters, or items. Prices automatically adjust.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">💰 Accurate Pricing</h3>
            <p className="text-sm text-gray-600">
              High-precision pricing in INR with automatic conversion and calculation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
