import NextAuth, { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { login as apiLogin } from '@/lib/api/auth';
import type { User } from '@/types';

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        user: User & DefaultSession['user'];
    }

    interface User {
        id: string;
        name: string;
        email: string;
        created_at: string;
        email_verified: boolean;
        accessToken?: string;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const response = await apiLogin({
                        email: credentials.email as string,
                        password: credentials.password as string,
                    });

                    if (response.access_token && response.user) {
                        return {
                            ...response.user,
                            accessToken: response.access_token,
                        } as any;
                    }

                    return null;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            // On initial sign in, store user data and token
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.user = user as any;
            }

            // When session.update() is called, re-fetch user data from backend
            if (trigger === 'update' && token.accessToken) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token.accessToken}`,
                        },
                    });

                    if (response.ok) {
                        const updatedUser = await response.json();
                        token.user = {
                            ...(token.user || {}),
                            ...updatedUser,
                        } as any;
                    }
                } catch (error) {
                    console.error('Failed to refresh user data:', error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token.accessToken) {
                session.accessToken = token.accessToken as string;
            }
            if (token.user) {
                session.user = token.user as any;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
    },
});
