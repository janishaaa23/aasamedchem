'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NavBar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  async function handleLogout() {
    await signOut({ redirect: false })
    router.push('/login')
  }

  if (!session) {
    return null
  }

  const isAdmin = session.user.role === 'admin'
  const dashboardUrl = isAdmin ? '/admin' : '/seller'

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={dashboardUrl} className="text-xl font-bold text-blue-600">
            AasaMedChem
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
              <>
                <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition">
                  Dashboard
                </Link>
                <Link href="/admin/products" className="text-gray-700 hover:text-blue-600 transition">
                  Products
                </Link>
                <Link href="/admin/orders" className="text-gray-700 hover:text-blue-600 transition">
                  Orders
                </Link>
              </>
            ) : (
              <>
                <Link href="/seller" className="text-gray-700 hover:text-blue-600 transition">
                  Dashboard
                </Link>
                <Link href="/seller/products" className="text-gray-700 hover:text-blue-600 transition">
                  Products
                </Link>
                <Link href="/seller/orders" className="text-gray-700 hover:text-blue-600 transition">
                  My Orders
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p className="font-medium text-gray-900">{session.user.name}</p>
              <p className="text-gray-600">
                {session.user.role === 'admin' ? 'Administrator' : 'Seller'}
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                👤
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
