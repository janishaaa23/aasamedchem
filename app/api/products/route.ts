import { auth } from '@/lib/auth'
import { getClient } from '@/lib/db/client'
import { Product, CreateProductRequest, ApiResponse } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const client = getClient()
    const products = await client`
      SELECT 
        id, sku, name, description, category, 
        unit_dimension, quantity_in_base_unit, base_price_inr,
        available_units, created_at, updated_at
      FROM products
      ORDER BY name ASC
    `

    return NextResponse.json({
      success: true,
      data: products,
    } as ApiResponse<Product[]>)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' } as ApiResponse<null>,
        { status: 403 }
      )
    }

    const body = (await request.json()) as CreateProductRequest

    // Validate input
    if (
      !body.sku ||
      !body.name ||
      !body.unit_dimension ||
      body.base_price_inr === undefined
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse<null>,
        { status: 400 }
      )
    }

    const client = getClient()
    const result = await client`
      INSERT INTO products (
        sku, name, description, category, unit_dimension,
        quantity_in_base_unit, base_price_inr, available_units
      ) VALUES (
        ${body.sku},
        ${body.name},
        ${body.description || null},
        ${body.category || null},
        ${body.unit_dimension},
        ${body.quantity_in_base_unit || 0},
        ${body.base_price_inr},
        ${{ weight: ['g', 'kg'], volume: ['mL', 'L'], count: ['item'] }[body.unit_dimension]}
      )
      RETURNING id, sku, name, description, category, unit_dimension, 
                quantity_in_base_unit, base_price_inr, available_units,
                created_at, updated_at
    `

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<Product>,
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' } as ApiResponse<null>,
      { status: 500 }
    )
  }
}
