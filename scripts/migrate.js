/**
 * Database migration script
 * Run this to initialize the database schema
 */

require('dotenv').config({ path: '.env.local' })
const postgres = require('postgres')

async function migrate() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('ERROR: DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const sql = postgres(connectionString)

  try {
    console.log('Starting database migration...')

    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'seller', 'buyer')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✓ Created users table')

    // Products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sku VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        seller_id UUID REFERENCES users(id),
        unit_dimension VARCHAR(20) NOT NULL CHECK (unit_dimension IN ('weight', 'volume', 'count')),
        quantity_in_base_unit NUMERIC(18, 6) NOT NULL DEFAULT 0,
        base_price_inr NUMERIC(12, 4) NOT NULL,
        available_units JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✓ Created products table')

    // Orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) NOT NULL UNIQUE,
        seller_id UUID NOT NULL REFERENCES users(id),
        buyer_id UUID REFERENCES users(id),
        status VARCHAR(50) NOT NULL DEFAULT 'quotation' CHECK (status IN ('quotation', 'confirmed', 'rejected', 'completed')),
        total_price_inr NUMERIC(12, 4) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✓ Created orders table')

    // Order items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        quantity_requested NUMERIC(18, 6) NOT NULL,
        unit_chosen VARCHAR(20) NOT NULL,
        price_per_unit_inr NUMERIC(12, 4) NOT NULL,
        total_price_inr NUMERIC(12, 4) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✓ Created order_items table')

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`

    console.log('✓ Created indexes')
    console.log('\n✓ Database migration completed successfully!')
  } catch (error) {
    console.error('ERROR during migration:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

migrate()
