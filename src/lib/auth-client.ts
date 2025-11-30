import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient()

export const { useSession, signIn, signOut, signUp } = authClient

export type Session = typeof authClient.$Infer.Session