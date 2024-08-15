import { Lucia } from "lucia"
import adapter from "./adapter"
import { cookies } from "next/headers"
import { cache } from "react"
import { GitHub } from "arctic"
import db from "../database"
import { eq } from "drizzle-orm"

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      githubId: attributes.github_id,
      username: attributes.username,
      avatarUrl: attributes.avatar_url,
      email: attributes.email,
      authProvider: attributes.authProvider
    };
  }
})

// Github OAuth
export const github = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!);

// This function can then be used in server components and form actions to get the current session and user.
export const validateRequest = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null

  if (!sessionId)
    return {
      user: null,
      session: null,
    }

  const { user, session } = await lucia.validateSession(sessionId)
  if (user && user.id) {
    const dbUser = await db.query.userTable.findFirst({
      where: (table) => eq(table.id, user?.id),
    })
    if (dbUser) {
      user.avatarUrl = dbUser?.avatarUrl ?? ""
      user.username = dbUser?.username ?? ""
      user.email = dbUser?.email ?? ""
      user.authProvider = dbUser?.authProvider ?? ""
    }
  }

  try {
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      )
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      )
    }
  } catch {
    // Next.js throws error when attempting to set cookies when rendering page
  }

  return {
    user,
    session,
  }
})

// IMPORTANT! 
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  github_id: number;
  username: string;
  email: string;
  avatar_url: string;
  authProvider: string;
}