# LOCAL DEVELOPMENT SETUP

## Prerequisites

- Node.js 18+ (download from https://nodejs.org/)
- npm or yarn
- PostgreSQL (for local testing) OR access to Neon PostgreSQL
- Git

## Quick Start

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd AASAMEDCHEM
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database connection:

```
# Neon PostgreSQL Connection String
DATABASE_URL=postgresql://user:password@neon.tech/dbname

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Application
NEXT_PUBLIC_APP_NAME=AasaMedChem Inventory
NODE_ENV=development
```

### 4. Initialize Database

Run migrations to create tables:

```bash
npm run db:migrate
```

Seed with demo data:

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

After seeding, you can log in with:

- **Admin**: admin@example.com / demo123
- **Seller**: seller@example.com / demo123

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Format code
npm run format

# Database operations
npm run db:migrate      # Create database schema
npm run db:seed         # Populate demo data
```

## Project Structure

```
AASAMEDCHEM/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── seller/            # Seller pages
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/
│   ├── db/               # Database utilities
│   ├── utils/            # Helper functions (units, etc)
│   ├── auth.ts           # NextAuth configuration
│   └── types.ts          # TypeScript types
├── scripts/              # Database scripts
├── public/               # Static assets
├── .env.example          # Environment template
└── README.md             # Documentation
```

## Database Setup

### Using Neon PostgreSQL (Recommended)

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Paste into `DATABASE_URL` in `.env.local`

### Using Local PostgreSQL

1. Install PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE aasamedchem;
   ```
3. Get connection string:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/aasamedchem
   ```

## Testing the Application

### Test Admin Flow

1. Login as admin@example.com
2. Go to /admin
3. Create a product:
   - SKU: TEST-001
   - Name: Test Product
   - Unit: Weight
   - Base Quantity: 1000
   - Base Price: 100

### Test Seller Flow

1. Login as seller@example.com
2. Go to /seller
3. Browse products
4. Place an order:
   - Select the product
   - Enter quantity (e.g., 2.5)
   - Select unit (e.g., kg)
   - Verify price calculation
   - Submit order

### Test Unit Conversions

- Order 1 kg of a product priced at ₹100/gram
- Should calculate: 1000g × ₹100/g = ₹100,000
- Display as: 1 kg @ ₹100,000/kg

## Troubleshooting

### Connection Refused

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**: Ensure PostgreSQL is running or update `DATABASE_URL` to correct host.

### Module Not Found

**Error**: `Cannot find module '@/'`

**Solution**: Restart dev server after installing packages:
```bash
npm run dev
```

### Database Seed Fails

**Error**: `ERROR during seed`

**Solution**: 
- Check DATABASE_URL is correct
- Run migrations first: `npm run db:migrate`
- Verify database credentials

### Authentication Issues

**Error**: `Invalid email or password`

**Solution**:
- Ensure users were created: `npm run db:seed`
- Check NEXTAUTH_SECRET is set
- Verify database connection works

### Port Already in Use

**Error**: `Error: listen EADDRINUSE :::3000`

**Solution**: Kill the process or use different port:
```bash
npm run dev -- -p 3001
```

## Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## TypeScript

This project is fully typed with TypeScript. Check types with:

```bash
npx tsc --noEmit
```

## API Testing

### Using curl

```bash
# Get all products
curl http://localhost:3000/api/products

# Create product (requires auth)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{...}'

# Get all orders
curl http://localhost:3000/api/orders
```

### Using Postman

1. Open Postman
2. Set base URL: `http://localhost:3000`
3. Authentication: Use session/cookies after login
4. Test endpoints in `/api/*` routes

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: description"

# Push to origin
git push origin feature/my-feature

# Create pull request on GitHub
```

## Performance Tips

- Use `npm run build` to check for build errors
- Monitor API response times in browser DevTools
- Use React DevTools extension for component debugging
- Check database query performance with Neon dashboard

## Security Notes

- Never commit `.env.local` to GitHub
- Rotate `NEXTAUTH_SECRET` periodically
- Use strong passwords for database
- Validate all user inputs
- Sanitize database queries (postgres client handles this)

## Next Steps

After local setup works:

1. Create feature branches for new features
2. Test thoroughly locally
3. Push to GitHub
4. Deploy to Vercel
5. Perform production testing

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
