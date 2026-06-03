import { auth } from '@/lib/auth'
import { getClient } from '@/lib/db/client'
import { Product, CreateProductRequest, ApiResponse } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products - List all products
export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    const client = getClient()

    let products

    if (session?.user?.role === 'seller') {
      products = await client`
        SELECT id, sku, name, description, category,
               unit_dimension, quantity_in_base_unit, base_price_inr,
               available_units, seller_id, created_at, updated_at
        FROM products
        WHERE seller_id = ${session.user.id}
        ORDER BY name ASC
      `
    } else {
      products = await client`
        SELECT id, sku, name, description, category,
               unit_dimension, quantity_in_base_unit, base_price_inr,
               available_units, seller_id, created_at, updated_at
        FROM products
        ORDER BY name ASC
      `
    }

    return NextResponse.json({
      success: true,
      data: products as unknown as Product[],
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

// POST /api/products - Create a new product (admin or seller)
const availableUnitsMap: Record<'weight' | 'volume' | 'count', string[]> = {
  weight: ['g', 'kg'],
  volume: ['mL', 'L'],
  count: ['item'],
}

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

    // Only admin or seller may create products
    if (session.user.role !== 'admin' && session.user.role !== 'seller') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin or Seller access required' } as ApiResponse<null>,
        { status: 403 }
      )
    }

    const body = (await request.json()) as CreateProductRequest
    const quantityInBaseUnit =
      typeof body.quantity_in_base_unit === 'string'
        ? parseFloat(body.quantity_in_base_unit)
        : body.quantity_in_base_unit
    const basePriceInr =
      typeof body.base_price_inr === 'string'
        ? parseFloat(body.base_price_inr)
        : body.base_price_inr

    if (!body.unit_dimension || !availableUnitsMap[body.unit_dimension]) {
      return NextResponse.json(
        { success: false, error: 'Invalid unit_dimension. Accepted values: weight, volume, count' } as ApiResponse<null>,
        { status: 400 }
      )
    }

    // Validate input
    if (
      !body.sku ||
      !body.name ||
      quantityInBaseUnit === undefined ||
      Number.isNaN(quantityInBaseUnit) ||
      Number.isNaN(basePriceInr)
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid required fields' } as ApiResponse<null>,
        { status: 400 }
      )
    }

    const availableUnits = availableUnitsMap[body.unit_dimension]
    const client = getClient()
    const result = await client`
      INSERT INTO products (
        sku, name, description, category, seller_id, unit_dimension,
        quantity_in_base_unit, base_price_inr, available_units
      ) VALUES (
        ${body.sku},
        ${body.name},
        ${body.description || null},
        ${body.category || null},
        ${session.user.role === 'seller' ? session.user.id : null},
        ${body.unit_dimension},
        ${quantityInBaseUnit},
        ${basePriceInr},
        ${JSON.stringify(availableUnits)}::jsonb
      )
      RETURNING id, sku, name, description, category, seller_id, unit_dimension, 
                quantity_in_base_unit, base_price_inr, available_units,
                created_at, updated_at
    `

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<Product>,
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    const message = error instanceof Error ? error.message : 'Failed to create product'
    return NextResponse.json(
      { success: false, error: message } as ApiResponse<null>,
      { status: 500 }
    )
  }
}
