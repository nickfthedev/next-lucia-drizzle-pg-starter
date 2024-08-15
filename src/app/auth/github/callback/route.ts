// app/login/github/callback/route.ts
import { github, lucia } from "@/lib/lucia";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import db from "~/src/lib/database";
import { eq } from "drizzle-orm";
import { userTable } from "~/src/lib/database/schema";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("github_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400
    });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    const response = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    const emails: GitHubEmail[] = await response.json();
    const githubUser: GitHubUser = await githubUserResponse.json();
    const primaryEmail = emails.find((email) => email.primary);
    if (!primaryEmail?.verified) {
      const errorMessage = encodeURIComponent("Email not verified. Please verify your email on GitHub and try again.");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/auth/signin?error=${errorMessage}`
        }
      });
    }
    // Replace this with your own DB client.
    const existingUser = await db.query.userTable.findFirst({
      where: (user) => eq(user.githubId, githubUser.id)
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/"
        }
      });
    }

    const userId = generateIdFromEntropySize(10); // 16 characters long

    // Replace this with your own DB client.
    try {
      await db
        .insert(userTable)
        .values({
          id: userId,
          email: primaryEmail.email,
          username: githubUser.login,
          hashedPassword: null,
          verifyEmailToken: null,
          verifyEmailTokenCreatedAt: null,
          verifyEmailAddress: null,
          githubId: githubUser.id,
          authProvider: "github",
          avatarUrl: githubUser.avatar_url,
        })
        .returning({
          id: userTable.id,
          email: userTable.email,
          username: userTable.username,
        })
    } catch (error: any) {
      console.error(error);
      // Check if the error is a duplicate email
      if (error?.message.includes("duplicate key value")) {
        const errorMessage = encodeURIComponent("Email/Username already exists. Please sign in with the same provider as used before. If you cannot remember your provider, please use the reset password feature.");
        return new Response(null, {
          status: 302,
          headers: {
            Location: `/auth/signin?error=${errorMessage}`
          }
        });
      }
      console.error(error);
      const errorMessage = encodeURIComponent("Error logging in with GitHub");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/auth/signin?error=${errorMessage}`
        }
      });
    }

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/"
      }
    });
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      console.error(e);
      const errorMessage = encodeURIComponent("Invalid code. Please try again.");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/auth/signin?error=${errorMessage}`
        }
      });
    }
    console.error(e);
    const errorMessage = encodeURIComponent("Error logging in with GitHub");
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/auth/signin?error=${errorMessage}`
      }
    });
  }
}

interface GitHubUser {
  id: string;
  login: string;
  avatar_url: string;
  email: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string;
}