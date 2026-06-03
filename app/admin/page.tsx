import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Products</h3>
            <p className="text-3xl font-bold text-blue-600">Manage Products</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Orders</h3>
            <p className="text-3xl font-bold text-green-600">View Orders</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Users</h3>
            <p className="text-3xl font-bold text-purple-600">Manage Users</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <p className="text-yellow-800">
            ⚠️ Admin dashboard is under construction. Features will include:
          </p>
          <ul className="list-disc list-inside text-yellow-800 mt-2 space-y-1">
            <li>Product management (create, update, delete)</li>
            <li>View all orders and quotations</li>
            <li>Configure base prices and units</li>
            <li>Approve/reject orders</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
