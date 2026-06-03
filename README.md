# AasaMedChem Inventory & Order Management System

## Project Overview

AasaMedChem is a modern inventory and order management system designed for pharmaceutical companies. It enables administrators to manage pharmaceutical products with complex unit systems (weight, volume, count) and allows sellers to place quotations and orders with flexible unit selection.

### Key Features

- **Role-Based Access Control**: Admin and Seller roles with different permissions
- **Multi-Unit Support**: Handle products in multiple dimensions (grams, kilograms, liters, milliliters, items)
- **High-Precision Pricing**: Support for fractional quantities and INR pricing with decimal precision
- **Quotation & Order Management**: Complete flow from quotation to order confirmation
- **Unit Conversion**: Seamless conversion between units with consistent calculation
- **Search & Filter**: Browse and filter products by category and other criteria

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Hook Form**: Form state management

### Backend
- **Next.js API Routes**: RESTful API endpoints
- **NextAuth.js**: Authentication and authorization
- **Zod**: Schema validation

### Database
- **PostgreSQL (Neon)**: Cloud-hosted relational database
- **Decimal.js**: High-precision arithmetic for pricing

### Deployment
- **Vercel**: Serverless deployment platform

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                     │
│  Login → Dashboard → Products Search → Order Creation        │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              API Routes (Next.js)                             │
│  /api/auth/*  /api/products/*  /api/orders/*                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│           Database (PostgreSQL)                               │
│  users | products | orders | order_items                     │
└──────────────────────────────────────────────────────────────┘
```

## Database Schema

### Unit Conversion and Storage Strategy

#### Internal Unit Storage
- **Weight Dimension**: All weights stored in **grams (g)**
  - Conversion: 1 kg = 1000 g
  
- **Volume Dimension**: All volumes stored in **milliliters (mL)**
  - Conversion: 1 L = 1000 mL
  
- **Count Dimension**: All counts stored as **items**
  - No conversion needed

#### Pricing Strategy
- All prices stored in **INR (Indian Rupees)**
- **Data Type**: `NUMERIC(12, 4)` for precision
  - Precision: 4 decimal places (paise level)
  - Maximum value: 99,999,999.9999 INR
- **Price Storage**: Price per base unit
  - Example: Product priced at ₹50/gram means `base_price_inr = 50`

#### Quantity Strategy
- **Data Type**: `NUMERIC(18, 6)` for precision
  - Precision: 6 decimal places
  - Maximum: 999,999,999,999.999999
  - Supports fractional quantities (e.g., 0.5 kg)

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'seller')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  unit_dimension VARCHAR(20) CHECK (unit_dimension IN ('weight', 'volume', 'count')),
  quantity_in_base_unit NUMERIC(18, 6) NOT NULL,
  base_price_inr NUMERIC(12, 4) NOT NULL,
  available_units JSONB NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  seller_id UUID REFERENCES users(id),
  status VARCHAR(50) CHECK (status IN ('quotation', 'confirmed', 'rejected', 'completed')),
  total_price_inr NUMERIC(12, 4) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### order_items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity_requested NUMERIC(18, 6) NOT NULL,
  unit_chosen VARCHAR(20) NOT NULL,
  price_per_unit_inr NUMERIC(12, 4) NOT NULL,
  total_price_inr NUMERIC(12, 4) NOT NULL,
  created_at TIMESTAMP
);
```

## Unit Conversion Implementation

### Where Conversions Happen

1. **On Input (Before Saving)**
   - When a seller enters quantity in a chosen unit (e.g., 2.5 kg)
   - Convert to base unit (2.5 kg → 2500 g) for storage
   - File: `lib/utils/units.ts` → `convertToBaseUnit()`

2. **On Display (Before Showing)**
   - When displaying products, convert from base unit to display unit
   - File: `lib/utils/units.ts` → `convertFromBaseUnit()`

3. **During Calculation**
   - Calculate price using base unit quantity and base price
   - File: `lib/utils/units.ts` → `calculatePrice()`

### Conversion Functions

```typescript
// Convert to base unit (for storage)
convertToBaseUnit(quantity: 2.5, unit: 'kg', dimension: 'weight') 
→ 2500 g

// Convert from base unit (for display)
convertFromBaseUnit(quantityInBase: 2500, toUnit: 'kg', dimension: 'weight')
→ 2.5 kg

// Calculate price
calculatePrice(quantityInBase: 2500, basePricePerUnit: 50)
→ 125,000 INR (2500 g × ₹50/g)
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Vercel account (for deployment)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AASAMEDCHEM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with:
   ```
   DATABASE_URL=postgresql://user:password@host/dbname
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Initialize the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Login

**Test Credentials:**
- **Admin**: admin@example.com / demo123
- **Seller**: seller@example.com / demo123

Navigate to `/login` and enter credentials.

### Admin Panel (`/admin`)

Features available to admin users:

1. **Product Management**
   - Create new products with SKU, name, category
   - Set unit dimension (weight, volume, count)
   - Configure base quantity and base price
   - Edit and delete products

2. **Order Management**
   - View all quotations and orders
   - See order details, units, and calculated pricing
   - Verify conversions and prices
   - Update order status (confirm, reject, complete)

3. **Inventory**
   - Monitor stock levels
   - View inventory in base units

### Seller Panel (`/seller`)

Features available to seller users:

1. **Browse Products**
   - Search products by name, SKU, or category
   - Filter by unit dimension (weight, volume, count)
   - View available units for each product

2. **Place Quotation/Order**
   - Select one or more products
   - Enter quantity in any supported unit
   - See real-time price calculation
   - Review total before submission
   - Optional: Add notes to quotation

3. **Order History**
   - View all placed quotations and orders
   - Track order status
   - See order details and pricing breakdown

## Price Calculation Example

**Scenario**: Seller orders 2.5 kg of Aspirin Powder

Product Setup:
- SKU: ASPIRIN-500G
- Unit Dimension: weight
- Base Quantity: 1000 g (internal storage)
- Base Price: ₹50/gram

**Calculation Flow**:

1. **Input**: 2.5 kg (in seller's chosen unit)
2. **Convert to Base**: 2.5 kg × 1000 = 2500 g
3. **Calculate Price**: 2500 g × ₹50/gram = **₹125,000**
4. **Display**: "2.5 kg @ ₹50,000/kg = ₹125,000"

## Unit Conversion Examples

### Weight Dimension
```
1 kg = 1000 g
0.5 kg = 500 g
2.5 kg = 2500 g
```

### Volume Dimension
```
1 L = 1000 mL
0.5 L = 500 mL
2.5 L = 2500 mL
```

### Count Dimension
```
1 item = 1 item
100 items = 100 items
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product (admin only)
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)

### Orders
- `GET /api/orders` - List orders (sellers see own, admin sees all)
- `POST /api/orders` - Create quotation/order (sellers only)
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status (admin only)

## Data Type Justifications

| Field | Type | Reason |
|-------|------|--------|
| `quantity_in_base_unit` | `NUMERIC(18, 6)` | Support large values and fractional quantities with 6 decimal precision |
| `base_price_inr` | `NUMERIC(12, 4)` | INR prices with paise-level precision (4 decimals) |
| `total_price_inr` | `NUMERIC(12, 4)` | Same precision as base price for consistency |
| `id` | `UUID` | Globally unique, distributed system safe |
| `available_units` | `JSONB` | Store array of units dynamically, allows querying |

## Git Workflow

We follow a commit-per-feature approach:

```bash
# Initial setup
git add .
git commit -m "init: setup Next.js project with auth and database schema"

# Feature commits
git commit -m "feat: implement unit conversion system"
git commit -m "feat: create admin product management API"
git commit -m "feat: build seller order placement flow"
```

## Deployment on Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`: Your Neon PostgreSQL connection string
     - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
     - `NEXTAUTH_URL`: Your production URL

3. **Deploy**
   - Vercel automatically deploys on push to main
   - Check deployments at [vercel.com/dashboard](https://vercel.com/dashboard)

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure Neon database is active
- Check firewall/network rules allow connection

### Authentication Failing
- Ensure user exists in database (run seed script)
- Check `NEXTAUTH_SECRET` is set
- Verify credentials are correct

### Unit Conversion Errors
- Ensure product `unit_dimension` is set correctly
- Check `available_units` contains the requested unit
- Verify Decimal.js precision is correct

## Future Enhancements

- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Bulk order imports (CSV)
- [ ] Invoice generation
- [ ] Inventory alerts
- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] Warehouse management
- [ ] Mobile app

## Support & Contributing

For issues, questions, or contributions, please contact the development team.

---

**Last Updated**: June 2024
**Version**: 1.0.0
