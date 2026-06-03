/**
 * Database seed script
 * Run this to populate the database with demo data
 */

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

    // Create admin and seller users
    const adminId = crypto.randomUUID()
    const sellerId = crypto.randomUUID()

    await sql`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES 
        (${adminId}, 'admin@example.com', 'demo123', 'Admin User', 'admin'),
        (${sellerId}, 'seller@example.com', 'demo123', 'Test Seller', 'seller')
      ON CONFLICT (email) DO NOTHING
    `
    console.log('✓ Created demo users')

    // Create sample products
    const products = [
      {
        sku: 'ASPIRIN-500G',
        name: 'Aspirin Powder',
        category: 'Analgesics',
        unit_dimension: 'weight',
        quantity_in_base_unit: 1000, // 1000 grams
        base_price_inr: 50, // Price per gram
      },
      {
        sku: 'INSULIN-100ML',
        name: 'Insulin Solution',
        category: 'Endocrine',
        unit_dimension: 'volume',
        quantity_in_base_unit: 500, // 500 mL
        base_price_inr: 2000, // Price per mL
      },
      {
        sku: 'TABLET-PACK-100',
        name: 'Multivitamin Tablets',
        category: 'Supplements',
        unit_dimension: 'count',
        quantity_in_base_unit: 100, // 100 items
        base_price_inr: 5, // Price per item
      },
      {
        sku: 'SYRUP-500ML',
        name: 'Cough Syrup',
        category: 'Cough & Cold',
        unit_dimension: 'volume',
        quantity_in_base_unit: 500, // 500 mL
        base_price_inr: 150, // Price per mL
      },
      {
        sku: 'POWDER-250G',
        name: 'Antibiotic Powder',
        category: 'Antibiotics',
        unit_dimension: 'weight',
        quantity_in_base_unit: 250, // 250 grams
        base_price_inr: 200, // Price per gram
      },
    ]

    for (const product of products) {
      await sql`
        INSERT INTO products 
          (sku, name, category, unit_dimension, quantity_in_base_unit, base_price_inr, available_units)
        VALUES 
          (${product.sku}, ${product.name}, ${product.category}, ${product.unit_dimension}, 
           ${product.quantity_in_base_unit}, ${product.base_price_inr},
           ${
             product.unit_dimension === 'weight'
               ? ['g', 'kg']
               : product.unit_dimension === 'volume'
                 ? ['mL', 'L']
                 : ['item']
           })
        ON CONFLICT (sku) DO NOTHING
      `
    }
    console.log(`✓ Created ${products.length} sample products`)

    console.log('\n✓ Database seed completed successfully!')
    console.log('\nDemo Users:')
    console.log('  Admin: admin@example.com / demo123')
    console.log('  Seller: seller@example.com / demo123')
  } catch (error) {
    console.error('ERROR during seed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

seed()
