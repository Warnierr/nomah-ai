import NextAuth, { DefaultSession } from 'next-auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import Email from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { sendMagicLinkEmail } from '@/lib/email'

declare module 'next-auth' {
  interface Session {
    user: {
      role?: 'USER' | 'ADMIN'
    } & DefaultSession['user']
  }
  
  interface User {
    role?: 'USER' | 'ADMIN'
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  providers: [
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        try {
          await sendMagicLinkEmail({
            email,
            magicLink: url,
            provider: provider.name || 'Email',
          })
        } catch (error) {
          console.error('Failed to send magic link email:', error)
          throw new Error('Failed to send verification email')
        }
      },
    }),
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

        const user = await prisma.user.findUnique({
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
          role: user.role as 'USER' | 'ADMIN',
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github' || account?.provider === 'google' || account?.provider === 'email') {
        if (!user.email) return false

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (!existingUser && account?.provider !== 'email') {
          // Create new user for OAuth providers (email provider users are created by adapter)
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
            },
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as 'USER' | 'ADMIN'
      } else if (token.email) {
        // Fetch user role from database for existing sessions
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true },
        })
        if (dbUser) {
          token.role = dbUser.role as 'USER' | 'ADMIN'
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as 'USER' | 'ADMIN'
      }
      return session
    },
  },
})