/**
 * Type definitions for database models and API responses
 */

export type UserRole = 'admin' | 'seller' | 'buyer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  category?: string
  unit_dimension: 'weight' | 'volume' | 'count'
  quantity_in_base_unit: string // Using string to preserve precision
  base_price_inr: string
  available_units: string[]
  seller_id?: string | null
  created_at: Date
  updated_at: Date
}

export interface Order {
  id: string
  order_number: string
  seller_id: string
  buyer_id?: string
  status: 'quotation' | 'confirmed' | 'rejected' | 'completed'
  total_price_inr: string
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity_requested: string
  unit_chosen: string
  price_per_unit_inr: string
  total_price_inr: string
  created_at: Date
}

// Extended types for API responses
export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[]
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product
}

// Request/Response types
export interface CreateProductRequest {
  sku: string
  name: string
  description?: string
  category?: string
  unit_dimension: 'weight' | 'volume' | 'count'
  quantity_in_base_unit: number | string
  base_price_inr: number | string
}

export interface CreateOrderRequest {
  items: {
    product_id: string
    quantity_requested: number | string
    unit_chosen: string
  }[]
  notes?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
