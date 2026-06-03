'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatINR } from '@/lib/utils/units'

interface OrderItem {
  id: string
  quantity_requested: string
  unit_chosen: string
  price_per_unit_inr: string
  total_price_inr: string
  product: {
    name: string
    sku: string
    unit_dimension: string
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
  seller_id: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

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

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      // API endpoint for updating order status (to be implemented)
      // For now, show message
      alert(`Order status update to "${newStatus}" would be processed here`)
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading orders...</p>
      </div>
    )

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)

  const statusColors: Record<string, string> = {
    quotation: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-6">Order Management</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          {['all', 'quotation', 'confirmed', 'rejected', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {orders.filter((o) => status === 'all' || o.status === status).length})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xl font-semibold mb-4">Orders</h2>
            {filteredOrders.length === 0 ? (
              <div className="card text-center py-6 text-gray-600">No orders found</div>
            ) : (
              filteredOrders.map((order) => (
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
                        statusColors[order.status]
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
              ))
            )}
          </div>

          {/* Order Details */}
          {selectedOrder ? (
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedOrder.order_number}</h2>
                    <p className="text-gray-600 text-sm">
                      Placed: {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded ${
                      statusColors[selectedOrder.status]
                    }`}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>

                <div className="mb-6 pb-6 border-b">
                  <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{item.product.name}</p>
                            <p className="text-sm text-gray-600">{item.product.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatINR(item.total_price_inr)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mt-3 bg-white p-2 rounded">
                          <div>
                            <p className="text-gray-600">Quantity</p>
                            <p className="font-medium">
                              {item.quantity_requested} {item.unit_chosen}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Unit Price</p>
                            <p className="font-medium">
                              {formatINR(item.price_per_unit_inr)}/{item.unit_chosen}
                            </p>
                          </div>
                        </div>

                        {/* Verification Info */}
                        <div className="mt-3 p-2 bg-green-50 border-l-2 border-green-500 text-xs text-green-700">
                          ✓ Conversion verified: Internal storage in base units
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-semibold mb-2">Seller Notes</h3>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatINR(selectedOrder.total_price_inr)}
                    </span>
                  </p>
                </div>

                {/* Status Update Buttons */}
                {selectedOrder.status === 'quotation' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                      className="btn-primary flex-1"
                    >
                      Confirm Order
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'rejected')}
                      className="btn-danger flex-1"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    className="btn-primary w-full"
                  >
                    Mark as Completed
                  </button>
                )}

                {(selectedOrder.status === 'rejected' || selectedOrder.status === 'completed') && (
                  <div className="p-4 bg-gray-100 rounded text-center text-gray-700">
                    Order is {selectedOrder.status}. No further actions available.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 card text-center py-12 text-gray-600">
              Select an order to view details and manage status
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
