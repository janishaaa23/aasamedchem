import { auth } from '@/lib/auth'
import { getClient } from '@/lib/db/client'
import { OrderWithItems, CreateOrderRequest, ApiResponse } from '@/lib/types'
import { calculatePrice, convertToBaseUnit } from '@/lib/utils/units'
import { NextRequest, NextResponse } from 'next/server'
import Decimal from 'decimal.js'

// GET /api/orders - List orders based on user role
export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      )
    }

    const client = getClient()

    let orders

    if (session.user.role === 'admin') {
      // Admin sees all orders
      orders = await client`
        SELECT id, order_number, seller_id, buyer_id, status, total_price_inr, notes,
               created_at, updated_at
        FROM orders
        ORDER BY created_at DESC
      `
    } else if (session.user.role === 'seller') {
      // Sellers see only their own seller orders
      console.log("SELLER SESSION:", session.user)
      orders = await client`
        SELECT id, order_number, seller_id, buyer_id, status, total_price_inr, notes,
               created_at, updated_at
        FROM orders
        WHERE seller_id = ${session.user.id}
        ORDER BY created_at DESC
      `
    } else {
      // Buyers see only their own orders
      orders = await client`
        SELECT id, order_number, seller_id, buyer_id, status, total_price_inr, notes,
               created_at, updated_at
        FROM orders
        WHERE buyer_id = ${session.user.id}
        ORDER BY created_at DESC
      `
    }

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await client`
          SELECT oi.id, oi.order_id, oi.product_id, oi.quantity_requested,
                 oi.unit_chosen, oi.price_per_unit_inr, oi.total_price_inr,
                 oi.created_at,
                 p.id as p_id, p.sku, p.name, p.description, p.category,
                 p.unit_dimension, p.quantity_in_base_unit, p.base_price_inr,
                 p.available_units, p.created_at as p_created_at, 
                 p.updated_at as p_updated_at
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ${order.id}
        `

        return {
          ...order,
          items: items.map((item) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            quantity_requested: item.quantity_requested,
            unit_chosen: item.unit_chosen,
            price_per_unit_inr: item.price_per_unit_inr,
            total_price_inr: item.total_price_inr,
            created_at: item.created_at,
            product: {
              id: item.p_id,
              sku: item.sku,
              name: item.name,
              description: item.description,
              category: item.category,
              unit_dimension: item.unit_dimension,
              quantity_in_base_unit: item.quantity_in_base_unit,
              base_price_inr: item.base_price_inr,
              available_units: item.available_units,
              created_at: item.p_created_at,
              updated_at: item.p_updated_at,
            },
          })),
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: ordersWithItems,
    } as ApiResponse<OrderWithItems[]>)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// POST /api/orders - Create a new order (buyers only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      )
    }

    if (session.user.role !== 'buyer') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Buyers only' } as ApiResponse<null>,
        { status: 403 }
      )
    }

    const body = (await request.json()) as CreateOrderRequest

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must have at least one item' } as ApiResponse<null>,
        { status: 400 }
      )
    }

    const client = getClient()

console.log("==== ORDER DEBUG ====")
console.log("session.user =", session.user)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Calculate total price
    let totalPrice = new Decimal(0)
    let sellerId: string | null = null

    for (const item of body.items) {
      const product = await client`SELECT * FROM products WHERE id = ${item.product_id}`
      if (!product || product.length === 0) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.product_id}` } as ApiResponse<null>,
          { status: 404 }
        )
      }

      const prod = product[0]
      if (!sellerId) {
        sellerId = prod.seller_id || null
      } else if (prod.seller_id !== sellerId) {
        return NextResponse.json(
          { success: false, error: 'All items in an order must belong to the same seller' } as ApiResponse<null>,
          { status: 400 }
        )
      }

      const quantityInBase = convertToBaseUnit(
        item.quantity_requested,
        item.unit_chosen,
        prod.unit_dimension
      )

      const itemPrice = calculatePrice(quantityInBase, prod.base_price_inr)
      totalPrice = totalPrice.plus(itemPrice)
    }
console.log("sellerId =", sellerId)
console.log("buyerId =", session.user.id)
console.log("totalPrice =", totalPrice.toString())
    // Create order
    const order = await client`
      INSERT INTO orders (order_number, seller_id, buyer_id, total_price_inr, notes)
      VALUES (${orderNumber}, ${sellerId}, ${session.user.id}, ${totalPrice.toString()}, ${body.notes || null})
      RETURNING id, order_number, seller_id, buyer_id, status, total_price_inr, notes, created_at, updated_at
    `

    const orderId = order[0].id

    // Create order items
    const items = await Promise.all(
      body.items.map(async (item) => {
        const product = await client`SELECT * FROM products WHERE id = ${item.product_id}`
        const prod = product[0]

        const quantityInBase = convertToBaseUnit(
          item.quantity_requested,
          item.unit_chosen,
          prod.unit_dimension
        )

        const pricePerUnit = new Decimal(prod.base_price_inr).times(
          new Decimal(
            {
              weight: { g: 1, kg: 1000 },
              volume: { mL: 1, L: 1000 },
              count: { item: 1 },
            }[prod.unit_dimension][item.unit_chosen] || 1
          )
        )

        const itemPrice = new Decimal(item.quantity_requested).times(pricePerUnit)

        return await client`
          INSERT INTO order_items (
            order_id, product_id, quantity_requested, unit_chosen,
            price_per_unit_inr, total_price_inr
          ) VALUES (
            ${orderId}, ${item.product_id}, ${item.quantity_requested.toString()},
            ${item.unit_chosen}, ${pricePerUnit.toString()}, ${itemPrice.toString()}
          )
          RETURNING id, order_id, product_id, quantity_requested, unit_chosen,
                    price_per_unit_inr, total_price_inr, created_at
        `
      })
    )

    return NextResponse.json(
      {
        success: true,
        data: {
          ...order[0],
          items: items.flat(),
        },
      } as ApiResponse<OrderWithItems>,
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' } as ApiResponse<null>,
      { status: 500 }
    )
  }
}
