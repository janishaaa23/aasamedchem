import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getClient } from './db/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'seller'
    }
  }

  interface JWT {
    id: string
    role: 'admin' | 'seller'
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
          const user = await client`
            SELECT id, email, name, role, is_active
            FROM users
            WHERE email = ${credentials.email as string} AND is_active = true
          `

          if (!user || user.length === 0) {
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
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role as 'admin' | 'seller'
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
})
