import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect(session.user.role === 'admin' ? '/admin' : '/seller')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">AasaMedChem</h1>
        <p className="text-xl text-gray-600 mb-8">Inventory & Order Management System</p>

        <div className="space-x-4">
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">Demo Credentials</h2>
          <div className="text-left space-y-2 text-sm">
            <p>
              <strong>Admin:</strong> admin@example.com / demo123
            </p>
            <p>
              <strong>Seller:</strong> seller@example.com / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
