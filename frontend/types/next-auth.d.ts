import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            accessToken: string
            premium_until?: string | null
            subscription_status?: string
            accepted_terms_version?: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: string
        accessToken: string
        full_name?: string
        premium_until?: string | null
        subscription_status?: string
        accepted_terms_version?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        accessToken: string
        accepted_terms_version?: string
    }
}
