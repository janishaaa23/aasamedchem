# Quick Start Guide

Get AasaMedChem up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed ([download](https://nodejs.org/))
- PostgreSQL database access or Neon account ([create free account](https://neon.tech))
- Git installed

## 5-Minute Setup

### 1. Clone & Install (1 min)

```bash
git clone <repository-url>
cd AASAMEDCHEM
npm install
```

### 2. Setup Database (2 min)

Create `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:

```
DATABASE_URL=postgresql://user:password@host/dbname
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Initialize Database (1 min)

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Server (1 min)

```bash
npm run dev
```

Open: http://localhost:3000

## Login & Explore

**Admin Account:**
- Email: `admin@example.com`
- Password: `demo123`
- Access: `/admin`

**Seller Account:**
- Email: `seller@example.com`
- Password: `demo123`
- Access: `/seller`

## Core Features Demo

### 1. As Admin: Create Product

1. Go to http://localhost:3000/admin/products
2. Click "+ Add New Product"
3. Fill in:
   - SKU: `TEST-DEMO-001`
   - Name: `Demo Product`
   - Unit: `Weight (g, kg)`
   - Quantity: `1000`
   - Price: `100`
4. Click "Create Product"

### 2. As Seller: Place Order

1. Go to http://localhost:3000/seller/products
2. Select the product you just created
3. Enter quantity: `2.5`
4. Select unit: `kg`
5. See price: ₹250,000 (2.5 kg × ₹100,000/kg)
6. Click "Place Order / Quotation"

### 3. As Admin: Manage Order

1. Go to http://localhost:3000/admin/orders
2. Select the quotation created
3. Click "Confirm Order"
4. Status changes to "confirmed"

## Key Concepts

### Units Explained

- **Weight**: Store in grams (g) → Display as g or kg
- **Volume**: Store in mL → Display as mL or L
- **Count**: Store as items → Display as items

Example: 1.5 kg stored as 1500 g internally

### Pricing Explained

- Base price per unit (e.g., ₹50/gram)
- System multiplies by quantity in base unit
- Results shown in INR with Indian formatting

Example: 500g × ₹50/g = ₹25,000

## Troubleshooting

### Database Connection Error

**Problem**: `Error: connect ECONNREFUSED`

**Solution**:
- Verify DATABASE_URL is correct
- Check PostgreSQL/Neon is running
- Ensure credentials are right

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE :::3000`

**Solution**:
```bash
npm run dev -- -p 3001
```

### Login Fails

**Problem**: "Invalid email or password"

**Solution**:
- Run `npm run db:seed` again
- Check NEXTAUTH_SECRET is set
- Verify database has users

## Next Steps

1. **Read Full Documentation**: See [README.md](README.md)
2. **Test Everything**: Follow [TESTING.md](TESTING.md)
3. **Understand Architecture**: Read [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Deploy to Production**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)

## Common Tasks

### Create Multiple Products

```bash
# 1. Weight product
SKU: PRODUCT-W-001
Name: Weight Product
Unit: Weight
Base: 1000g @ ₹50/g

# 2. Volume product  
SKU: PRODUCT-V-001
Name: Volume Product
Unit: Volume
Base: 500mL @ ₹200/mL

# 3. Count product
SKU: PRODUCT-C-001
Name: Count Product
Unit: Count
Base: 100 items @ ₹10/item
```

### Test Unit Conversions

Place orders with different units for same product:
- Order 1: 0.5 kg (should = ₹25,000 if ₹50/g)
- Order 2: 500 g (should = ₹25,000)
- Verify both match!

### View API Data

```bash
# Get all products
curl http://localhost:3000/api/products

# Get all orders (need valid session)
curl http://localhost:3000/api/orders
```

## File Locations

| What | Where |
|------|-------|
| Admin Features | `/app/admin/` |
| Seller Features | `/app/seller/` |
| API Routes | `/app/api/` |
| Unit Logic | `/lib/utils/units.ts` |
| Auth Config | `/lib/auth.ts` |
| Database Client | `/lib/db/client.ts` |

## Development Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm start          # Run production build
npm run lint       # Check code quality
npm run format     # Format code
npm run db:migrate # Create database
npm run db:seed    # Add demo data
```

## Environment Variables

```bash
DATABASE_URL          # PostgreSQL connection string
NEXTAUTH_SECRET       # Session encryption key
NEXTAUTH_URL          # Your app URL (http://localhost:3000)
NODE_ENV              # development/production
NEXT_PUBLIC_APP_NAME  # App name displayed in UI
```

## Support

For issues, check:
1. [LOCAL_SETUP.md](LOCAL_SETUP.md) - Setup troubleshooting
2. [TESTING.md](TESTING.md) - Testing guide
3. [ARCHITECTURE.md](ARCHITECTURE.md) - System design
4. [CHANGELOG.md](CHANGELOG.md) - What's included

## What's Inside

✓ User authentication & roles (Admin/Seller)  
✓ Product management  
✓ Order placement with unit conversion  
✓ Real-time price calculation  
✓ Order status tracking  
✓ Responsive UI  
✓ API with authorization  
✓ PostgreSQL database  
✓ Deployment ready  

## Time Estimates

| Task | Time |
|------|------|
| Setup & database | 5-10 min |
| Create products | 5 min |
| Place orders | 3 min |
| Test conversions | 5 min |
| Full exploration | 30 min |

---

**Ready to dive in?** → `npm run dev` and go to http://localhost:3000

Need help? Check the documentation files in the repo root.

**Happy coding!** 🚀
