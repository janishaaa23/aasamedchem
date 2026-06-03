/**
 * Database Schema for AasaMedChem Inventory Management System
 * 
 * UNIT CONVERSION STRATEGY:
 * - All quantities are stored in their BASE UNITS internally:
 *   - Weight: grams (g)
 *   - Volume: milliliters (mL)
 *   - Count: items (unit/count)
 * 
 * - Conversion Factors:
 *   - 1 kg = 1000 g
 *   - 1 L = 1000 mL
 *   - Count is stored as-is
 * 
 * PRICING STRATEGY:
 * - All prices are stored in INR (Indian Rupees)
 * - Prices use NUMERIC type with high precision (12,4) for accuracy
 *   - Maximum value: 99,999,999.9999 INR
 *   - Precision: 4 decimal places (paise level)
 * 
 * QUANTITY STRATEGY:
 * - Quantities use NUMERIC type with precision (18,6)
 *   - Supports fractional quantities (e.g., 0.5 kg)
 *   - Maximum: 999,999,999,999.999999
 */

export const schema = `
-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'seller', 'buyer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  seller_id UUID REFERENCES users(id),
  
  -- Unit dimension: 'weight', 'volume', or 'count'
  unit_dimension VARCHAR(20) NOT NULL CHECK (unit_dimension IN ('weight', 'volume', 'count')),
  
  -- Base unit stored in: grams (weight), milliliters (volume), items (count)
  quantity_in_base_unit NUMERIC(18, 6) NOT NULL DEFAULT 0,
  
  -- Base price per unit in INR (price per gram, mL, or item)
  base_price_inr NUMERIC(12, 4) NOT NULL,
  
  -- Available units as JSON array: ["g", "kg"] for weight, ["mL", "L"] for volume, ["item"] for count
  available_units JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders/Quotations table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  
  -- Reference to the seller fulfilling the order
  seller_id UUID REFERENCES users(id),
  
  -- The buyer placing the order
  buyer_id UUID REFERENCES users(id),
  
  -- Order status: 'quotation' or 'confirmed'
  status VARCHAR(50) NOT NULL DEFAULT 'quotation' CHECK (status IN ('quotation', 'confirmed', 'rejected', 'completed')),
  
  -- Total price in INR
  total_price_inr NUMERIC(12, 4) NOT NULL,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items (line items in an order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  
  -- Quantity requested in the display unit
  quantity_requested NUMERIC(18, 6) NOT NULL,
  
  -- The unit chosen by the seller (e.g., 'kg', 'L', 'item')
  unit_chosen VARCHAR(20) NOT NULL,
  
  -- Price per unit (in the chosen unit) in INR
  price_per_unit_inr NUMERIC(12, 4) NOT NULL,
  
  -- Total price for this line item (quantity * price_per_unit) in INR
  total_price_inr NUMERIC(12, 4) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
`
