import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import config from '@/lib/config';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          console.log("[NextAuth] Attempting login for:", credentials.email);

          // 1. Login to get token
          const loginUrl = `${config.apiBaseUrl}/auth/login`;
          const res = await fetch(loginUrl, {
            method: 'POST',
            body: new URLSearchParams({
              'username': credentials.email,
              'password': credentials.password
            }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error(`[NextAuth] Login failed status=${res.status} url=${loginUrl} response=${errorText}`);
            return null;
          }

          const data = await res.json();
          const token = data.access_token;

          if (!token) {
            console.error("[NextAuth] No access_token received");
            return null;
          }

          // 2. Fetch user details with token
          // Prefer /auth/me from the router
          const meUrl = `${config.apiBaseUrl}/auth/me`;
          const userRes = await fetch(meUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!userRes.ok) {
            console.error(`[NextAuth] User fetch failed status=${userRes.status}`);
            return null;
          }

          const userData = await userRes.json();

          return {
            id: userData.id,
            email: userData.email,
            name: userData.full_name,
            role: userData.role?.toUpperCase(), // Normalize to 'ADMIN', 'SUPER_ADMIN', 'USER'
            accessToken: token,
          };

        } catch (e) {
          console.error("[NextAuth] Auth exception", e);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'carriey_super_secret_jwt_key_development_2026',
};
