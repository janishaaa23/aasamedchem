# System Architecture

## Overview

AasaMedChem is a full-stack inventory and order management system built with modern web technologies. It uses a layered architecture with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  (Next.js Pages, React Components, Tailwind CSS)               │
│                                                                  │
│  - AdminDashboard  - SellerDashboard                            │
│  - ProductBrowser  - OrderPlacement                             │
│  - OrderManagement - AuthPages                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    API LAYER                                     │
│  (Next.js API Routes, RESTful endpoints)                        │
│                                                                  │
│  /api/auth/*       - Authentication                             │
│  /api/products/*   - Product management (CRUD)                  │
│  /api/orders/*     - Order management (CRUD)                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                 BUSINESS LOGIC LAYER                             │
│  (Conversion Utils, Type Validation, Authorization)             │
│                                                                  │
│  - Unit Conversion (units.ts)                                   │
│  - Pricing Calculations (Decimal.js)                            │
│  - Auth & Role Validation (auth.ts)                             │
│  - Type Definitions (types.ts)                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                  DATA ACCESS LAYER                               │
│  (PostgreSQL Client, Connection Management)                     │
│                                                                  │
│  - Database Client (postgres library)                           │
│  - Connection Pool (Neon hosting)                               │
│  - SQL Query Execution                                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                 PERSISTENCE LAYER                                │
│  (Neon PostgreSQL Database)                                     │
│                                                                  │
│  users table       - User accounts & roles                      │
│  products table    - Product catalog                            │
│  orders table      - Order headers                              │
│  order_items table - Order line items                           │
└──────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **State Management**: Zustand (if needed for complex state)
- **HTTP Client**: Fetch API (built-in)

### Backend
- **Runtime**: Node.js (via Next.js API Routes)
- **Framework**: Next.js API Routes
- **Authentication**: NextAuth.js with Credentials provider
- **Session**: JWT
- **Validation**: Zod (for future schema validation)

### Database
- **System**: PostgreSQL
- **Hosting**: Neon (serverless PostgreSQL)
- **Client**: postgres.js (native SQL client)
- **Precision**: NUMERIC types for financial data

### Deployment
- **Platform**: Vercel
- **Functions**: Serverless (Edge Functions & Serverless Functions)
- **CDN**: Global CDN via Vercel
- **CI/CD**: GitHub → Vercel automatic deployment

## Directory Structure

```
AASAMEDCHEM/
├── app/                           # Next.js App Router (pages & API routes)
│   ├── api/                       # API endpoints
│   │   ├── auth/[...nextauth]/    # Authentication routes
│   │   ├── products/              # Product API routes
│   │   │   └── [id]/              # Product detail/edit/delete
│   │   └── orders/                # Order API routes
│   │       └── [id]/status/       # Order status update
│   ├── admin/                     # Admin pages (protected)
│   │   ├── products/              # Product management
│   │   └── orders/                # Order management
│   ├── seller/                    # Seller pages (protected)
│   │   ├── products/              # Product browser
│   │   └── orders/                # Order history
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Home page
│   └── login/                     # Authentication page
│
├── components/                    # React components
│   ├── NavBar.tsx                 # Navigation component
│   └── AuthProvider.tsx           # NextAuth provider wrapper
│
├── lib/                           # Core utilities & logic
│   ├── db/
│   │   ├── client.ts              # Database connection management
│   │   └── schema.ts              # Database schema definitions
│   ├── utils/
│   │   └── units.ts               # Unit conversion logic
│   ├── auth.ts                    # NextAuth configuration
│   └── types.ts                   # TypeScript type definitions
│
├── scripts/                       # Database scripts
│   ├── migrate.js                 # Database migration (create tables)
│   └── seed.js                    # Database seeding (demo data)
│
├── public/                        # Static files
├── middleware.ts                  # Route protection middleware
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── .eslintrc.json                 # ESLint rules
├── .prettierrc                    # Code formatting rules
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies & scripts
├── README.md                      # Project documentation
├── DEPLOYMENT.md                  # Deployment guide
├── LOCAL_SETUP.md                 # Local development guide
├── TESTING.md                     # Testing checklist
└── ARCHITECTURE.md                # This file
```

## Data Flow

### Product Browsing Flow

```
Seller User
    ↓
[GET /seller/products page]
    ↓
[useEffect → fetch /api/products]
    ↓
[API Route: GET /api/products]
    ↓
[Database Query: SELECT * FROM products]
    ↓
[Products returned as JSON]
    ↓
[Display in UI with search/filter]
```

### Order Placement Flow

```
Seller selects products & quantities
    ↓
[Real-time calculation of prices using units.ts]
    ↓
[POST /api/orders with order data]
    ↓
[API validates: auth, data, unit conversions]
    ↓
[For each item:
  - Convert quantity to base unit
  - Calculate price
  - Validate product exists]
    ↓
[INSERT order header + order items]
    ↓
[Return order with generated order_number]
    ↓
[UI shows success, redirect to /seller/orders]
```

### Order Management Flow

```
Admin views /admin/orders
    ↓
[Fetch all orders via /api/orders]
    ↓
[Admin sees quotation/confirmed/rejected/completed status]
    ↓
[Admin clicks "Confirm Order"]
    ↓
[PUT /api/orders/{id}/status with status: "confirmed"]
    ↓
[Database UPDATE orders SET status = 'confirmed']
    ↓
[UI updates order status in real-time]
```

## Unit Conversion System

### Strategy

**All quantities stored in BASE UNITS internally:**
- Weight → Grams (g)
- Volume → Milliliters (mL)
- Count → Items

**Conversion happens at:**
1. **Input time** (before saving) - user enters in kg, convert to g
2. **Display time** (before showing) - display in user's preferred unit
3. **Calculation time** - calculate prices using base units

### Example: Order 2.5 kg of ₹50/gram Product

```
User Input: 2.5 kg

Step 1: Convert to Base Unit (in API)
  2.5 kg × 1000 (conversion factor) = 2500 g

Step 2: Calculate Price
  2500 g × ₹50/gram = ₹125,000

Step 3: Store in Database
  quantity_requested: "2.5"
  unit_chosen: "kg"
  quantity_in_base_unit_calculated: 2500 (for verification)
  total_price_inr: "125000"

Step 4: Display to Admin
  Show: "2.5 kg @ ₹50,000/kg = ₹125,000"
  (Price per kg = 1000 g × ₹50 = ₹50,000)
```

## Authentication & Authorization

### Authentication Flow

```
User enters credentials
    ↓
[POST /api/auth/signin via NextAuth]
    ↓
[Check user in database]
    ↓
[Verify password (simplified: compare strings)]
    ↓
[Issue JWT token]
    ↓
[Store in secure HTTP-only cookie]
    ↓
[Redirect to dashboard]
```

### Authorization Checks

**Middleware (middleware.ts)**:
- Protects routes (/admin, /seller)
- Prevents cross-role access
- Redirects unauthenticated users to /login

**API Routes**:
```typescript
const session = await auth()
if (!session) return 401 Unauthorized
if (session.user.role !== 'admin') return 403 Forbidden
```

## Pricing & Decimal Precision

### Data Types

| Field | Type | Precision | Range |
|-------|------|-----------|-------|
| `base_price_inr` | NUMERIC(12,4) | 4 decimals | ±99,999,999.9999 |
| `quantity_in_base_unit` | NUMERIC(18,6) | 6 decimals | ±999,999,999,999.999999 |
| `total_price_inr` | NUMERIC(12,4) | 4 decimals | ±99,999,999.9999 |

### Precision Handling

Uses **Decimal.js** library to avoid floating-point errors:

```typescript
// ✗ Bad (floating-point):
2500 * 50 = 125000.00000001

// ✓ Good (Decimal):
new Decimal(2500).times(new Decimal(50)) = 125000 (exact)
```

## API Design

### RESTful Endpoints

```
Products:
  GET    /api/products              - List all products
  POST   /api/products              - Create product (admin)
  GET    /api/products/{id}         - Get single product
  PUT    /api/products/{id}         - Update product (admin)
  DELETE /api/products/{id}         - Delete product (admin)

Orders:
  GET    /api/orders                - List orders (role-based)
  POST   /api/orders                - Create order (seller)
  GET    /api/orders/{id}           - Get order details
  PUT    /api/orders/{id}/status    - Update status (admin)

Auth:
  POST   /api/auth/signin           - Sign in
  POST   /api/auth/signout          - Sign out
  GET    /api/auth/session          - Get current session
```

### Request/Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { /* resource data */ }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Error Handling

### Error Scenarios

| Scenario | Status | Handling |
|----------|--------|----------|
| Missing auth | 401 | Redirect to /login |
| Insufficient role | 403 | Return error, show in UI |
| Not found | 404 | Return error |
| Invalid input | 400 | Return validation error |
| Server error | 500 | Log error, return generic message |

## Performance Considerations

### Database Optimization

```sql
-- Indexes created for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### Caching Strategy

- Static pages: Cached by Vercel CDN
- API responses: Browser cache on GET requests
- Database: Connection pooling via Neon

### Lazy Loading

- Products loaded on demand
- Order items paginated (future enhancement)

## Security Measures

### Data Protection

- ✓ HTTPS enforced by Vercel
- ✓ Passwords hashed (bcrypt in production)
- ✓ JWT tokens for sessions
- ✓ Secure HTTP-only cookies

### Access Control

- ✓ Middleware validates roles
- ✓ API routes check authorization
- ✓ SQL injection prevention (parameterized queries)
- ✓ Environment variables for secrets

### Input Validation

- ✓ Type validation with TypeScript
- ✓ Schema validation (Zod ready)
- ✓ Database constraints (CHECK, UNIQUE)

## Scalability

### Vertical Scaling

- Vercel automatically scales serverless functions
- PostgreSQL connection pool via Neon

### Horizontal Scaling

- Stateless API routes (no server-side sessions)
- Database connection pooling
- Future: Cache layer (Redis)

### Database Growth

- Indexes on hot fields
- Partition orders table by date (future)
- Archive old orders (future)

## Monitoring & Logging

### Available Monitoring

- Vercel Analytics & Edge logs
- Neon database logs
- Browser DevTools (client-side)

### Suggested Improvements

- Application performance monitoring (APM)
- Error tracking (Sentry)
- Database query analysis
- User analytics

## Future Enhancements

1. **Product Images**: Store URLs in database
2. **Batch Orders**: Import orders from CSV
3. **Payment Integration**: Stripe/Razorpay
4. **Email Notifications**: Order confirmation emails
5. **Advanced Analytics**: Dashboard with charts
6. **Inventory Tracking**: Stock level warnings
7. **Multi-warehouse**: Multiple inventory locations
8. **API Key Auth**: For third-party integrations
9. **Webhooks**: Real-time order updates
10. **Mobile App**: React Native version

## Deployment Architecture

### Vercel Deployment

```
GitHub Repository
    ↓
[git push origin main]
    ↓
[GitHub Webhook → Vercel]
    ↓
[Vercel builds Next.js]
    ↓
[Runs build script: npm run build]
    ↓
[Deploys to Edge Network]
    ↓
[Environment variables injected]
    ↓
[API routes → Serverless Functions]
    ↓
[Pages → Edge Functions / CDN]
    ↓
[Connected to Neon Database]
    ↓
[Live at your-app.vercel.app]
```

## Development Workflow

```
1. Create feature branch: git checkout -b feature/xyz
2. Develop locally with npm run dev
3. Test locally (TESTING.md guide)
4. Commit with meaningful messages
5. Push to GitHub: git push origin feature/xyz
6. Create Pull Request (code review)
7. Merge to main
8. Vercel auto-deploys to production
9. Verify in production
```

---

**Document Version**: 1.0.0  
**Last Updated**: June 2024  
**Maintainer**: AasaMedChem Development Team
