'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatINR } from '@/lib/utils/units'

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
  created_at: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    unit_dimension: 'weight',
    quantity_in_base_unit: '',
    base_price_inr: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      })
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const payload = {
      ...formData,
      quantity_in_base_unit: Number(formData.quantity_in_base_unit),
      base_price_inr: Number(formData.base_price_inr),
    }

    if (
      Number.isNaN(payload.quantity_in_base_unit) ||
      Number.isNaN(payload.base_price_inr)
    ) {
      setError('Quantity and base price must be valid numbers')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        setError(`Server error: ${response.status} ${response.statusText} - ${responseText}`)
        return
      }

      if (response.ok && data.success) {
        setProducts([...products, data.data])
        setFormData({
          sku: '',
          name: '',
          description: '',
          category: '',
          unit_dimension: 'weight',
          quantity_in_base_unit: '',
          base_price_inr: '',
        })
        setShowForm(false)
        alert('Product created successfully!')
      } else {
        setError(data.error || `Failed to create product (${response.status})`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating product')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading products...</p>
      </div>
    )

  const unitsByDimension: Record<string, string[]> = {
    weight: ['g', 'kg'],
    volume: ['mL', 'L'],
    count: ['item'],
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-6">Product Management</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary mb-6"
        >
          {showForm ? 'Cancel' : '+ Add New Product'}
        </button>

        {/* Create Product Form */}
        {showForm && (
          <div className="card mb-6 border-2 border-blue-300">
            <h2 className="text-2xl font-bold mb-4">Create New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="input"
                    placeholder="e.g., ASPIRIN-500G"
                  />
                </div>
                <div>
                  <label className="label">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Aspirin Powder"
                  />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="Product description..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    placeholder="e.g., Analgesics"
                  />
                </div>
                <div>
                  <label className="label">Unit Dimension *</label>
                  <select
                    required
                    value={formData.unit_dimension}
                    onChange={(e) => setFormData({ ...formData, unit_dimension: e.target.value })}
                    className="input"
                  >
                    <option value="weight">Weight (g, kg)</option>
                    <option value="volume">Volume (mL, L)</option>
                    <option value="count">Count (items)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Initial Quantity in Base Unit *
                    <span className="text-xs text-gray-600">
                      {formData.unit_dimension === 'weight'
                        ? ' (in grams)'
                        : formData.unit_dimension === 'volume'
                          ? ' (in mL)'
                          : ' (in items)'}
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantity_in_base_unit}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity_in_base_unit: e.target.value })
                    }
                    className="input"
                    placeholder="e.g., 1000"
                  />
                </div>
                <div>
                  <label className="label">
                    Base Price in INR/unit *
                    <span className="text-xs text-gray-600">
                      (per {formData.unit_dimension === 'weight' ? 'gram' : formData.unit_dimension === 'volume' ? 'mL' : 'item'})
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.base_price_inr}
                    onChange={(e) => setFormData({ ...formData, base_price_inr: e.target.value })}
                    className="input"
                    placeholder="e.g., 50"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Available Units:</strong> {unitsByDimension[formData.unit_dimension].join(', ')}
                </p>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Creating...' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Product Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Unit Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Base Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const baseUnitLabel = {
                  weight: 'g',
                  volume: 'mL',
                  count: 'item',
                }[product.unit_dimension]

                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{product.sku}</td>
                    <td className="px-6 py-4 text-sm">{product.name}</td>
                    <td className="px-6 py-4 text-sm">{product.category || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {product.unit_dimension}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.quantity_in_base_unit} {baseUnitLabel}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatINR(product.base_price_inr)}/{baseUnitLabel}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button className="text-blue-600 hover:underline">Edit</button>
                      <button className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && !showForm && (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No products yet. Create your first product!</p>
          </div>
        )}
      </div>
    </div>
  )
}
