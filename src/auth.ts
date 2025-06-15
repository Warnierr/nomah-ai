import NextAuth, { DefaultSession } from 'next-auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

type UserRole = 'USER' | 'ADMIN'

declare module 'next-auth' {
  interface Session {
    user: {
      role?: UserRole
    } & DefaultSession['user']
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github' || account?.provider === 'google') {
        if (!user.email) return false

        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        })

        if (!existingUser) {
          // Create new user if doesn't exist
          await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'USER',
            },
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
}) 