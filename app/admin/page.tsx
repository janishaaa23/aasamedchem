import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {session.user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/products">
            <div className="card hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">📦 Products</h3>
              <p className="text-gray-600">Create and manage products, units, and pricing</p>
              <div className="mt-4 text-blue-600 font-semibold">Manage →</div>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="card hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">📋 Orders</h3>
              <p className="text-gray-600">View quotations, orders, and manage status</p>
              <div className="mt-4 text-green-600 font-semibold">View →</div>
            </div>
          </Link>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">👥 Users</h3>
            <p className="text-gray-600">Manage user accounts and permissions</p>
            <div className="mt-4 text-gray-400 font-semibold">Coming Soon</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">System Information</h2>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>✓ Database: Connected to Neon PostgreSQL</li>
            <li>✓ Unit Conversion: Weight (g, kg), Volume (mL, L), Count (items)</li>
            <li>✓ Pricing: High-precision INR formatting with decimal support</li>
            <li>✓ Authentication: Role-based access control (Admin/Seller)</li>
            <li>✓ API: RESTful endpoints for products, orders, and more</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
