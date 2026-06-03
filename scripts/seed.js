/**
 * Database seed script
 * Run this to populate the database with demo data
 */

require('dotenv').config({ path: '.env.local' })
const postgres = require('postgres')
const crypto = require('crypto')

async function seed() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('ERROR: DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const sql = postgres(connectionString)

  try {
    console.log('Starting database seed...')

    // Create admin, seller, and buyer users
    const adminId = crypto.randomUUID()
    const sellerId = crypto.randomUUID()
    const buyerId = crypto.randomUUID()

    await sql`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES 
        (${adminId}, 'admin@example.com', 'demo123', 'AasaMedChem Admin', 'admin'),
        (${sellerId}, 'garnier@example.com', 'demo123', 'Garnier Brand', 'seller'),
        (${buyerId}, 'myntra.customer@example.com', 'demo123', 'Myntra Shopper', 'buyer')
      ON CONFLICT (email) DO NOTHING
    `
    console.log('✓ Created demo users')

    // Create sample products
    const products = [
      {
        sku: 'GARNIER-MICEL-400ML',
        name: 'Garnier Micellar Cleansing Water',
        category: 'Skin Care',
        unit_dimension: 'volume',
        quantity_in_base_unit: 400,
        base_price_inr: 4.5,
        sellerId,
      },
      {
        sku: 'GARNIER-FACEWASH-150ML',
        name: 'Garnier Men Face Wash',
        category: 'Face Care',
        unit_dimension: 'volume',
        quantity_in_base_unit: 150,
        base_price_inr: 5.0,
        sellerId,
      },
      {
        sku: 'AASAMED-SYRINGE-100',
        name: 'Disposable Syringe Pack',
        category: 'Medical Supplies',
        unit_dimension: 'count',
        quantity_in_base_unit: 100,
        base_price_inr: 12.0,
        sellerId: null,
      },
      {
        sku: 'AASAMED-MASK-50',
        name: 'Surgical Mask Pack',
        category: 'Protective Equipment',
        unit_dimension: 'count',
        quantity_in_base_unit: 50,
        base_price_inr: 18.0,
        sellerId: null,
      },
      {
        sku: 'AASAMED-PAIN-500G',
        name: 'Aspirin Pain Relief Powder',
        category: 'Analgesics',
        unit_dimension: 'weight',
        quantity_in_base_unit: 500,
        base_price_inr: 3.0,
        sellerId: null,
      },
    ]

    for (const product of products) {
      await sql`
        INSERT INTO products 
          (sku, name, category, unit_dimension, quantity_in_base_unit, base_price_inr, available_units, seller_id)
        VALUES 
          (${product.sku}, ${product.name}, ${product.category}, ${product.unit_dimension}, 
           ${product.quantity_in_base_unit}, ${product.base_price_inr},
           ${
             product.unit_dimension === 'weight'
               ? ['g', 'kg']
               : product.unit_dimension === 'volume'
                 ? ['mL', 'L']
                 : ['item']
           }, ${product.sellerId})
        ON CONFLICT (sku) DO NOTHING
      `
    }
    console.log(`✓ Created ${products.length} sample products`)

    console.log('\n✓ Database seed completed successfully!')
    console.log('\nDemo Users:')
    console.log('  Admin: admin@example.com / demo123  (AasaMedChem Admin)')
    console.log('  Seller: garnier@example.com / demo123  (Garnier Brand)')
    console.log('  Buyer: myntra.customer@example.com / demo123  (Myntra Shopper)')
  } catch (error) {
    console.error('ERROR during seed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

seed()
