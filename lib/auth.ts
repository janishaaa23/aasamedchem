import NextAuth, { AuthOptions, DefaultSession, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getClient } from './db/client'

if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
}

const demoUsers = {
  admin: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'admin@example.com',
    name: 'AasaMedChem Admin',
    role: 'admin' as const,
  },
  seller: {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'seller@example.com',
    name: 'Demo Seller',
    role: 'seller' as const,
  },
  buyer: {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'buyer@example.com',
    name: 'Demo Buyer',
    role: 'buyer' as const,
  },
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'seller' | 'buyer'
    } & DefaultSession['user']
  }

  interface User {
    role: 'admin' | 'seller' | 'buyer'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'admin' | 'seller' | 'buyer'
  }
}

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const client = getClient()

console.log("LOGIN ATTEMPT:", credentials.email)

const user = await client`
  SELECT id, email, name, role, is_active
  FROM users
  WHERE email = ${credentials.email as string} AND is_active = true
`

console.log("USER FOUND:", user)

          if (!user || user.length === 0) {
            // Fallback for demo users when DB has no records
            if (credentials.email === demoUsers.admin.email && credentials.password === 'demo123') {
              console.log('Auth fallback: returning demo admin (no DB user)')
              return demoUsers.admin
            }
            if (credentials.email === demoUsers.seller.email && credentials.password === 'demo123') {
              console.log('Auth fallback: returning demo seller (no DB user)')
              return demoUsers.seller
            }
            if (credentials.email === demoUsers.buyer.email && credentials.password === 'demo123') {
              console.log('Auth fallback: returning demo buyer (no DB user)')
              return demoUsers.buyer
            }
            return null
          }

          // In production, use proper password hashing (bcrypt)
          // This is simplified for the demo
          if (credentials.password !== 'demo123') {
            return null
          }

          const userData = user[0]
          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          // If DB is unreachable or authentication fails at DB level, allow demo credentials for local dev
          if (credentials.email === demoUsers.admin.email && credentials.password === 'demo123') {
            console.log('Auth fallback: returning demo admin (DB error)')
            return demoUsers.admin
          }
          if (credentials.email === demoUsers.seller.email && credentials.password === 'demo123') {
            console.log('Auth fallback: returning demo seller (DB error)')
            return demoUsers.seller
          }
          if (credentials.email === demoUsers.buyer.email && credentials.password === 'demo123') {
            console.log('Auth fallback: returning demo buyer (DB error)')
            return demoUsers.buyer
          }
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role as 'admin' | 'seller' | 'buyer'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'admin' | 'seller' | 'buyer'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export const handlers = handler

export async function auth() {
  return await getServerSession(authOptions)
}
