import NextAuth, { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { login as apiLogin, googleLogin } from '@/lib/api/auth';
import type { User } from '@/types';

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        accessTokenExpires?: number;
        error?: string;
        user: User & DefaultSession['user'];
    }

    interface User {
        id: string;
        name: string;
        email: string;
        created_at: string;
        email_verified: boolean;
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),
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
                    // We hit the backend directly. 
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    const res = await fetch(`${baseUrl}/api/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    const data = await res.json();
                    
                    if (res.ok && data.access_token) {
                        const setCookie = res.headers.get("set-cookie");
                        let refreshToken = "";
                        if (setCookie) {
                            const match = setCookie.match(/harbaat_refresh=([^;]+)/i);
                            if (match) refreshToken = match[1];
                        }

                        return {
                            ...data.user,
                            accessToken: data.access_token,
                            refreshToken: refreshToken, // Put it in the user object so jwt callback sees it
                            expiresIn: data.expires_in || 900,
                        } as any;
                    }

                    return null;
                } catch (error) {
                    console.error('Auth authorize error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                let accessToken = (user as any).accessToken;
                let refreshToken = (user as any).refreshToken;
                let expiresIn = (user as any).expiresIn || 900;
                let userData = user;

                // For Google, we must exchange the id_token for our backend tokens
                if (account.provider === 'google') {
                    try {
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                        const res = await fetch(`${baseUrl}/api/auth/google`, {
                            method: 'POST',
                            body: JSON.stringify({
                                credential: account.id_token,
                            }),
                            headers: { "Content-Type": "application/json" }
                        });

                        const data = await res.json();
                        
                        if (res.ok && data.access_token) {
                            accessToken = data.access_token;
                            userData = data.user;
                            expiresIn = data.expires_in || 900;
                            
                            // Extract Refresh Token from backend cookie
                            const setCookie = res.headers.get("set-cookie");
                            if (setCookie) {
                                const match = setCookie.match(/harbaat_refresh=([^;]+)/i);
                                if (match) refreshToken = match[1];
                            }
                        }
                    } catch (error) {
                        console.error('Logout sync error:', error);
                    }
                }

                token.accessToken = accessToken;
                token.refreshToken = refreshToken;
                token.accessTokenExpires = Date.now() + expiresIn * 1000;
                token.user = userData as any;
                return token;
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < (token.accessTokenExpires as number)) {
                return token;
            }

            // Access token has expired, try to update it
            if (token.refreshToken) {
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    // We call the backend refresh. 
                    // IMPORTANT: We must use the exact cookie name the backend expects: harbaat_refresh
                    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
                        method: 'POST',
                        headers: {
                            'Cookie': `harbaat_refresh=${token.refreshToken}`,
                        },
                    });

                    const refreshedTokens = await response.json();

                    if (!response.ok) throw refreshedTokens;

                    return {
                        ...token,
                        accessToken: refreshedTokens.access_token,
                        accessTokenExpires: Date.now() + (refreshedTokens.expires_in || 900) * 1000,
                        // Update refresh token if shifted by backend (rotation)
                        refreshToken: refreshedTokens.refresh_token || token.refreshToken,
                    };
                } catch (error) {
                    console.error("Error refreshing access token", error);
                    return { ...token, error: "RefreshAccessTokenError" };
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.accessToken = token.accessToken as string;
                session.user = token.user as any;
                session.error = token.error as string;
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
