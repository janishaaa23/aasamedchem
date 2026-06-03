import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SellerPage() {
  const session = await auth()

  if (!session || session.user.role !== 'seller') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome, {session.user.name}!
        </h1>
        <p className="text-gray-600 mb-8">Seller Dashboard</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Browse Products</h3>
            <p className="text-gray-600 mb-4">Search and filter available products</p>
            <a href="/seller/products" className="btn-primary">
              Browse Products
            </a>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">My Orders</h3>
            <p className="text-gray-600 mb-4">View your quotations and orders</p>
            <a href="/seller/orders" className="btn-primary">
              View Orders
            </a>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800">
            ℹ️ Seller portal is under construction. Features will include:
          </p>
          <ul className="list-disc list-inside text-blue-800 mt-2 space-y-1">
            <li>Browse and search products</li>
            <li>Filter by category and unit dimension</li>
            <li>Place quotations and orders</li>
            <li>Flexible unit selection (g, kg, mL, L, items)</li>
            <li>See calculated prices based on quantity and unit</li>
            <li>Track order status</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
