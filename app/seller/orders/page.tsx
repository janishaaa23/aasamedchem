'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatINR, formatQuantity } from '../../../lib/utils/units'

interface OrderItem {
  id: string
  quantity_requested: string
  unit_chosen: string
  price_per_unit_inr: string
  total_price_inr: string
  product: {
    name: string
    sku: string
  }
}

interface Order {
  id: string
  order_number: string
  status: string
  total_price_inr: string
  notes?: string
  created_at: string
  items: OrderItem[]
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      if (data.success) {
        setOrders(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch orders')
      }
    } catch (err) {
      setError('Error fetching orders')
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading orders...</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/seller" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-6">My Orders</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No orders yet</p>
            <Link href="/seller/products" className="btn-primary">
              Place Your First Order
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`card cursor-pointer border-2 transition ${
                    selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm">{order.order_number}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        order.status === 'quotation'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {formatINR(order.total_price_inr)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{order.items.length} items</p>
                </div>
              ))}
            </div>

            {/* Order Details */}
            {selectedOrder ? (
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedOrder.order_number}</h2>
                      <p className="text-gray-600">
                        {new Date(selectedOrder.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded ${
                        selectedOrder.status === 'quotation'
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedOrder.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : selectedOrder.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>

                  <div className="mb-6 pb-6 border-b">
                    <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-600">{item.product.sku}</p>
                            <p className="text-sm mt-1">
                              <strong>Quantity:</strong> {item.quantity_requested} {item.unit_chosen}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Price per {item.unit_chosen}:</strong>{' '}
                              {formatINR(item.price_per_unit_inr)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatINR(item.total_price_inr)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="mb-6 pb-6 border-b">
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <p className="text-gray-700">{selectedOrder.notes}</p>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatINR(selectedOrder.total_price_inr)}
                      </span>
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Status Notes:</strong>
                      {selectedOrder.status === 'quotation'
                        ? ' Waiting for admin approval'
                        : selectedOrder.status === 'confirmed'
                          ? ' Your order has been approved!'
                          : selectedOrder.status === 'completed'
                            ? ' Order completed'
                            : ' Order rejected'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 card text-center py-12 text-gray-600">
                Select an order to view details
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
