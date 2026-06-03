# DEPLOYMENT GUIDE

## Vercel Deployment

This guide will walk you through deploying the AasaMedChem inventory system to Vercel.

### Prerequisites

- GitHub account with the repository pushed
- Vercel account (sign up at https://vercel.com)
- Neon PostgreSQL database connection string

### Step-by-Step Deployment

#### 1. Push Code to GitHub

```bash
# If not already pushed
git push origin main
```

#### 2. Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Select the AASAMEDCHEM repository
5. Click "Import"

#### 3. Configure Environment Variables

On the Vercel project configuration page, add these environment variables:

```
DATABASE_URL=postgresql://user:password@host/dbname
NEXTAUTH_SECRET=<generate-new-secret>
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-app.vercel.app`

### Post-Deployment Steps

#### 1. Run Database Migrations

After deployment, you need to initialize the database. You can do this by:

**Option A: Using CLI**
```bash
npm run db:migrate
npm run db:seed
```

**Option B: Direct Database Connection**
Use a PostgreSQL client to run the migration scripts from `scripts/migrate.js`.

#### 2. Test the Application

1. Go to your deployed URL
2. Test login with demo credentials:
   - Admin: admin@example.com / demo123
   - Seller: seller@example.com / demo123
3. Try the core flows:
   - Create a product (as admin)
   - Browse products (as seller)
   - Place an order (as seller)
   - Verify order (as admin)

### Neon PostgreSQL Setup

If you don't have a Neon database yet:

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Get your connection string from the dashboard
5. Use this as your `DATABASE_URL`

### Troubleshooting

#### Database Connection Issues

- Verify `DATABASE_URL` format: `postgresql://user:password@host/dbname`
- Check that your Neon project is active
- Ensure IP/network restrictions allow Vercel

#### Authentication Not Working

- Verify `NEXTAUTH_SECRET` is set (not empty)
- Ensure `NEXTAUTH_URL` matches your actual deployment URL
- Check that users exist in database (run seed script)

#### Build Failures

- Check Node.js version (needs 18+)
- Review build logs in Vercel dashboard
- Ensure all environment variables are set

### Redeploying

After making changes:

```bash
git add .
git commit -m "fix: description"
git push origin main
```

Vercel will automatically redeploy when you push to main.

### Monitoring & Logs

- View real-time logs: Go to Vercel dashboard → Project → Deployments
- Check application errors: Vercel → Project → Monitoring
- View database queries: Neon console

### Custom Domain

1. In Vercel project settings, go to Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to your custom domain

### Performance Optimization

- Vercel automatically optimizes Next.js
- Database queries are cached where possible
- CDN serves static assets globally
- Monitor performance in Vercel Analytics

### Scaling

As traffic increases:

- Vercel automatically scales serverless functions
- Consider upgrading Neon plan for higher database throughput
- Monitor database connection limits
- Use caching strategies for frequently accessed data
