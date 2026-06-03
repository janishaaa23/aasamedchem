'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatINR } from '@/lib/utils/units'
import Decimal from 'decimal.js'

interface Product {
  id: string
  sku: string
  name: string
  description?: string
  category?: string
  unit_dimension: string
  base_price_inr: string
  available_units: string[]
}

interface SelectedProduct {
  productId: string
  quantity: string
  unit: string
  pricePerUnit: string
}

export default function BuyerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Record<string, SelectedProduct>>({})
  const [orderNotes, setOrderNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]

  function toggleProductSelection(product: Product) {
    const key = product.id
    if (selectedProducts[key]) {
      const newSelected = { ...selectedProducts }
      delete newSelected[key]
      setSelectedProducts(newSelected)
      return
    }

    const defaultUnit = product.available_units[0] || 'g'
    const conversionFactors: Record<string, Record<string, number>> = {
      weight: { g: 1, kg: 1000 },
      volume: { mL: 1, L: 1000 },
      count: { item: 1 },
    }
    const factor = conversionFactors[product.unit_dimension]?.[defaultUnit] || 1

    setSelectedProducts({
      ...selectedProducts,
      [key]: {
        productId: product.id,
        quantity: '1',
        unit: defaultUnit,
        pricePerUnit: new Decimal(product.base_price_inr).times(factor).toString(),
      },
    })
  }

  function updateSelection(productId: string, field: string, value: string) {
    if (!selectedProducts[productId]) return

    const product = products.find((p) => p.id === productId)
    if (!product) return

    const updated = { ...selectedProducts[productId] }

    if (field === 'quantity') {
      updated.quantity = value
    } else if (field === 'unit') {
      updated.unit = value
      const conversionFactors: Record<string, Record<string, number>> = {
        weight: { g: 1, kg: 1000 },
        volume: { mL: 1, L: 1000 },
        count: { item: 1 },
      }
      const factor = conversionFactors[product.unit_dimension]?.[value] || 1
      updated.pricePerUnit = new Decimal(product.base_price_inr).times(factor).toString()
    }

    setSelectedProducts({
      ...selectedProducts,
      [productId]: updated,
    })
  }

  async function handleSubmitOrder() {
    const items = Object.values(selectedProducts).map((item) => ({
      product_id: item.productId,
      quantity_requested: item.quantity,
      unit_chosen: item.unit,
    }))

    if (items.length === 0) {
      setError('Please select at least one product')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, notes: orderNotes || undefined }),
      })
      const data = await response.json()
      if (data.success) {
        setSelectedProducts({})
        setOrderNotes('')
        alert(`Order created successfully: ${data.data.order_number}`)
      } else {
        setError(data.error || 'Failed to create order')
      }
    } catch (err) {
      setError('Error creating order')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-4">Loading products...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/buyer" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-6">Buy Products</h1>
          <p className="text-gray-600">Choose the product, select your preferred unit, and place an order.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Search & Filters</h3>
            <div className="mb-4">
              <label className="label">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product or SKU"
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
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              <strong>{Object.keys(selectedProducts).length}</strong> item(s) selected
            </div>
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredProducts.map((product) => {
                const isSelected = !!selectedProducts[product.id]
                const selection = selectedProducts[product.id]

                return (
                  <div
                    key={product.id}
                    className={`card border-2 transition ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => toggleProductSelection(product)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.sku}</p>
                      </div>
                      <input type="checkbox" checked={isSelected} className="w-4 h-4" readOnly />
                    </div>

                    {product.description && <p className="text-sm text-gray-600 mb-2">{product.description}</p>}
                    {product.category && (
                      <p className="text-xs bg-gray-100 text-gray-700 inline-block px-2 py-1 rounded mb-2">
                        {product.category}
                      </p>
                    )}

                    <p className="text-sm mb-2">
                      <strong>Base Price:</strong> {formatINR(product.base_price_inr)}/unit
                    </p>
                    <p className="text-sm text-gray-600">Units: {product.available_units.join(', ')}</p>

                    {isSelected && selection && (
                      <div className="mt-4 pt-4 border-t space-y-3" onClick={(event) => event.stopPropagation()}>
                        <div>
                          <label className="label">Quantity</label>
                          <input
                            type="number"
                            step="0.01"
                            value={selection.quantity}
                            onChange={(e) => updateSelection(product.id, 'quantity', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Unit</label>
                          <select
                            value={selection.unit}
                            onChange={(e) => updateSelection(product.id, 'unit', e.target.value)}
                            className="input"
                          >
                            {product.available_units.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-sm text-green-800">
                            <strong>Estimated:</strong> {formatINR(new Decimal(selection.quantity).times(selection.pricePerUnit))}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {Object.keys(selectedProducts).length > 0 && (
              <div className="card border-2 border-green-200 bg-green-50 p-5">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {Object.entries(selectedProducts).map(([productId, selection]) => {
                    const product = products.find((p) => p.id === productId)
                    if (!product) return null
                    const itemTotal = new Decimal(selection.quantity).times(selection.pricePerUnit)

                    return (
                      <div key={productId} className="flex justify-between text-sm pb-3 border-b">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-gray-600">{selection.quantity} {selection.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatINR(itemTotal)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="bg-white p-3 rounded mb-4">
                  <p className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatINR(Object.values(selectedProducts).reduce((sum, selection) => sum.plus(new Decimal(selection.quantity).times(selection.pricePerUnit)), new Decimal(0)))}</span>
                  </p>
                </div>

                <div className="mb-4">
                  <label className="label">Order Notes (Optional)</label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Add any special instructions..."
                  />
                </div>

                <button onClick={handleSubmitOrder} disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
