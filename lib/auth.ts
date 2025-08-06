import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// Remove bcrypt import since we're not using encryption
// import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}

// Dummy users for development
const DUMMY_USERS = [
  {
    id: "6883bf71eaa519ef5c7f7cc9",
    email: "admin@test.com",
    name: "Admin User",
    role: "admin",
    password: "admin123"
  },
  {
    id: "2",
    email: "user@test.com",
    name: "Regular User",
    role: "user",
    password: "user123"
  },
  {
    id: "3",
    email: "test@test.com",
    name: "Test User",
    role: "user",
    password: "test123"
  }
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // First, try to find user in dummy users (for development)
        const dummyUser = DUMMY_USERS.find(
          user => user.email === credentials.email && user.password === credentials.password
        )

        if (dummyUser) {
          return {
            id: dummyUser.id,
            email: dummyUser.email,
            name: dummyUser.name,
            role: dummyUser.role,
          }
        }

        // Then try database users (with plain text password comparison for now)
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            return null
          }

          // Plain text password comparison (NO ENCRYPTION)
          // WARNING: This is only for development - never use in production!
          const isPasswordValid = credentials.password === user.password

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Database error during authentication:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
}