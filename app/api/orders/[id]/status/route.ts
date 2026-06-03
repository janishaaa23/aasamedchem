import { auth } from '@/lib/auth'
import { getClient } from '@/lib/db/client'
import { Order, ApiResponse } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

// PUT /api/orders/[id]/status - Update order status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' } as ApiResponse<null>,
        { status: 403 }
      )
    }

    const { status } = (await request.json()) as { status: string }

    if (!status || !['quotation', 'confirmed', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' } as ApiResponse<null>,
        { status: 400 }
      )
    }

    const client = getClient()

    const result = await client`
      UPDATE orders
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING id, order_number, seller_id, status, total_price_inr, notes, created_at, updated_at
    `

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' } as ApiResponse<null>,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Order>)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' } as ApiResponse<null>,
      { status: 500 }
    )
  }
}
