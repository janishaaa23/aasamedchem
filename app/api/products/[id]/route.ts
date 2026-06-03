import { auth } from '@/lib/auth'
import { getClient } from '@/lib/db/client'
import { Product, CreateProductRequest, ApiResponse } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products/[id] - Get a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = getClient()
    const product = await client`
      SELECT 
        id, sku, name, description, category, 
        unit_dimension, quantity_in_base_unit, base_price_inr,
        available_units, created_at, updated_at
      FROM products
      WHERE id = ${params.id}
    `

    if (!product || product.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' } as ApiResponse<null>,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product[0],
    } as ApiResponse<Product>)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update a product (admin only)
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

    const body = (await request.json()) as Partial<CreateProductRequest>

    const client = getClient()

    // Get current product
    const current = await client`SELECT * FROM products WHERE id = ${params.id}`
    if (!current || current.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' } as ApiResponse<null>,
        { status: 404 }
      )
    }

    // Update product
    const result = await client`
      UPDATE products
      SET 
        name = ${body.name || current[0].name},
        description = ${body.description !== undefined ? body.description : current[0].description},
        category = ${body.category !== undefined ? body.category : current[0].category},
        quantity_in_base_unit = ${body.quantity_in_base_unit || current[0].quantity_in_base_unit},
        base_price_inr = ${body.base_price_inr || current[0].base_price_inr},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING id, sku, name, description, category, unit_dimension, 
                quantity_in_base_unit, base_price_inr, available_units,
                created_at, updated_at
    `

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Product>)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product (admin only)
export async function DELETE(
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

    const client = getClient()

    const result = await client`
      DELETE FROM products WHERE id = ${params.id}
      RETURNING id
    `

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' } as ApiResponse<null>,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    } as ApiResponse<null>)
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' } as ApiResponse<null>,
      { status: 500 }
    )
  }
}
