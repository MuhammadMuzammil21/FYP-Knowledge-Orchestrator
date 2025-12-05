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
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.user = user as any;
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
