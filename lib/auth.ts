import NextAuth, { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getClient } from './db/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'seller' | 'buyer'
    }
  }

  interface JWT {
    id: string
    role: 'admin' | 'seller' | 'buyer'
  }
}

const authOptions = {
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
            if (credentials.email === 'admin@example.com' && credentials.password === 'demo123') {
              console.log('Auth fallback: returning demo admin (no DB user)')
              return { id: 'demo-admin', email: 'admin@example.com', name: 'Admin User', role: 'admin' }
            }
            if (credentials.email === 'seller@example.com' && credentials.password === 'demo123') {
              console.log('Auth fallback: returning demo seller (no DB user)')
              return { id: '438a3e7f-6e82-4897-a621-80f2055c6f4f', email: 'seller@example.com', name: 'Test Seller', role: 'seller' }
            }
            if (credentials.email === 'buyer@example.com' && credentials.password === 'demo123') {
              console.log('Auth fallback: returning demo buyer (no DB user)')
              return { id: 'f59fa6ee-d589-497e-aa9e-d02469501d42', email: 'buyer@example.com', name: 'Demo Buyer', role: 'buyer' }
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
          if (credentials.email === 'admin@example.com' && credentials.password === 'demo123') {
            console.log('Auth fallback: returning demo admin (DB error)')
            return { id: 'demo-admin', email: 'admin@example.com', name: 'Admin User', role: 'admin' }
          }
          if (credentials.email === 'seller@example.com' && credentials.password === 'demo123') {
            console.log('Auth fallback: returning demo seller (DB error)')
            return { id: 'demo-seller', email: 'seller@example.com', name: 'Test Seller', role: 'seller' }
          }
          if (credentials.email === 'buyer@example.com' && credentials.password === 'demo123') {
            console.log('Auth fallback: returning demo buyer (DB error)')
            return { id: 'demo-buyer', email: 'buyer@example.com', name: 'Demo Buyer', role: 'buyer' }
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
        session.user.role = token.role
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
