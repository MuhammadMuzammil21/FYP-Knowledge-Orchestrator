import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { User } from "next-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://asim.daaimali.site/api";

// Get secret from environment variable with fallback
// Next.js reads .env.local automatically, but we provide a fallback for reliability
const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "0QBJdxb9DiMznv8IiLrmCPj5njILE/hOCKXzScJhG3s=";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: secret,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Login failed:", response.status, errorData);
            return null;
          }

          const user = await response.json();

          // Note: access_token should be stored client-side after successful login
          // This authorize function runs on the server, so we can't use localStorage here

          if (user && (user.id || user.user?.id) && (user.email || user.user?.email)) {
            const userData = user.user || user;
            return {
              id: userData.id,
              name: userData.name,
              email: userData.email,
            };
          }

          console.error("Invalid user data received:", user);
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/api/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});