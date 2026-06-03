'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatINR } from '../../../lib/utils/units'

interface Product {
  id: string
  sku: string
  name: string
  description?: string
  category?: string
  unit_dimension: string
  quantity_in_base_unit: string
  base_price_inr: string
  available_units: string[]
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.success) {
        setProducts(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch products')
      }
    } catch (err) {
      setError('Error fetching products')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading product catalog...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/seller" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">My Product Catalog</h1>
          <p className="text-gray-600">View and manage the products your company sells to buyers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-3">Catalog filters</h2>
            <div className="mb-4">
              <label className="label">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or SKU"
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="label">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
              <p>
                Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 grid gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-gray-600 mb-4">No products match your search and filter criteria.</p>
                <p className="text-sm text-gray-500">Create products from the admin panel or update existing entries.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="card border border-gray-200 bg-white p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.sku}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        {product.unit_dimension}
                      </span>
                    </div>
                    {product.description && <p className="text-sm text-gray-600 mt-3">{product.description}</p>}
                    <div className="mt-4 grid gap-3 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Category</span>
                        <span>{product.category || 'Uncategorized'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base stock</span>
                        <span>{product.quantity_in_base_unit} {product.unit_dimension === 'weight' ? 'g' : product.unit_dimension === 'volume' ? 'mL' : 'items'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base price</span>
                        <span>{formatINR(product.base_price_inr)}/{product.unit_dimension === 'weight' ? 'g' : product.unit_dimension === 'volume' ? 'mL' : 'item'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available units</span>
                        <span>{product.available_units.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
