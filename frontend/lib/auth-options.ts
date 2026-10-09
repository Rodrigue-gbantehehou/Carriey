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
          console.log("[NextAuth] Fetching from:", loginUrl);
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
            premium_until: userData.premium_until,
            subscription_status: userData.subscription_status,
            accepted_terms_version: userData.accepted_terms_version,
          };

        } catch (e) {
          console.error("[NextAuth] Auth exception", e);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.id = user.id;
        token.premium_until = user.premium_until;
        token.subscription_status = user.subscription_status;
        token.accepted_terms_version = user.accepted_terms_version;
      }
      if (trigger === "update" && session?.user) {
        token.accepted_terms_version = session.user.accepted_terms_version;
        token.premium_until = session.user.premium_until;
        token.subscription_status = session.user.subscription_status;
        if (session.user.name) token.name = session.user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken as string;
      session.user.role = token.role as string;
      session.user.id = token.id as string;
      session.user.premium_until = token.premium_until as string | null | undefined;
      session.user.subscription_status = token.subscription_status as string | undefined;
      session.user.accepted_terms_version = token.accepted_terms_version as string | undefined;
      return session;
    }
  },
  secret: (() => {
    const s = process.env.NEXTAUTH_SECRET;
    if (!s && process.env.NODE_ENV === 'production') {
      throw new Error('[Carriey] NEXTAUTH_SECRET est requis en production. Définissez cette variable d\'environnement.');
    }
    // En développement : fallback local uniquement (jamais exposé en prod)
    return s ?? 'carriey_dev_only_secret_not_for_production';
  })(),
};
