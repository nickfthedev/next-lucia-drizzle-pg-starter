"use server"

import { ForgotPasswordSchema, ProfileSchema, ResetPasswordSchema, SignInSchema, SignUpSchema, VerifyEmailSchema } from "@/types/auth"
import { generateIdFromEntropySize } from "lucia";
import db from "@/lib/database"
import { userTable } from "@/lib/database/schema"
import { lucia, validateRequest } from "@/lib/lucia"
import { cookies } from "next/headers"
import { eq } from "drizzle-orm"
import * as argon2 from "argon2"
import { createServerAction } from "zsa"
import { env } from "@/env"
import { sendMail } from "@/lib/mail";
import { z } from "zod";

// Sign up action
export const signUp = createServerAction()
  .input(SignUpSchema)
  .handler(async ({ input }) => {
    const hashedPassword = await argon2.hash(input.password)
    const userId = generateIdFromEntropySize(10)
    const verifyEmailToken = generateIdFromEntropySize(10)

    // Generate username from email add random number
    const username = input.email.split("@")[0] + Math.floor(Math.random() * 1000000)
    try {
      await db
        .insert(userTable)
        .values({
          id: userId,
          email: input.email,
          username,
          hashedPassword,
          verifyEmailToken,
          verifyEmailTokenCreatedAt: new Date(),
          verifyEmailAddress: input.email,
          authProvider: "password",
        })
        .returning({
          id: userTable.id,
          email: userTable.email,
          verifyEmailToken: userTable.verifyEmailToken,
          username: userTable.username,
        })

      // If the mail service is disabled, create a session cookie
      if (env.ENABLE_MAIL_SERVICE === false || env.AUTH_SEND_VERIFICATION_EMAIL === false) {
        const session = await lucia.createSession(userId, {
          expiresIn: 60 * 60 * 24 * 30,
        })
        const sessionCookie = lucia.createSessionCookie(session.id)
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        )
      }

      // If the mail service is enabled, send a verification email
      if (env.ENABLE_MAIL_SERVICE === true && env.AUTH_SEND_VERIFICATION_EMAIL === true) {
        await sendMail({
          to: [input.email],
          subject: "Verify your email",
          html: `Welcome on board!<br><br>Please verify your email by clicking on the link below:<br><a href="${env.APP_URL}/auth/verify-email?token=${verifyEmailToken}">Verify your email</a>`,
        })
      }

      return {
        success: true,
        data: {
          userId,
        },
      }
    } catch (error: any) {
      // Check if the error is a duplicate email
      if (error?.message.includes("duplicate key value")) {
        return {
          error: "Email already exists. Please sign in.",
        }
      }

      return {
        error: error?.message,
      }
    }
  })

// Sign in action
export const signIn = createServerAction()
  .input(SignInSchema)
  .handler(async ({ input }) => {
    const existingUser = await db.query.userTable.findFirst({
      where: (table) => eq(table.email, input.email),
    })

    if (!existingUser) {
      return {
        error: "Incorrect username or password",
      }
    }

    if (!existingUser.hashedPassword) {
      return {
        error: "Incorrect username or password",
      }
    }

    const isValidPassword = await argon2.verify(
      existingUser.hashedPassword,
      input.password
    )

    if (!isValidPassword) {
      return {
        error: "Incorrect username or password",
      }
    }

    if (!existingUser.verifiedAt && env.AUTH_SEND_VERIFICATION_EMAIL === true && env.ENABLE_MAIL_SERVICE === true) {
      return {
        error: "Email not verified. Please verify your email. If you didn't receive the email, please use the forgot password feature.",
      }
    }

    const session = await lucia.createSession(existingUser.id, {
      expiresIn: 60 * 60 * 24 * 30,
    })

    const sessionCookie = lucia.createSessionCookie(session.id)

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    return {
      success: "Logged in successfully",
    }
  })

// Normal Server Action, no zsa used because we just call it from the header
export const signOut = async () => {
  try {
    const { session } = await validateRequest()

    if (!session) {
      return {
        error: "Unauthorized",
      }
    }

    await lucia.invalidateSession(session.id)

    const sessionCookie = lucia.createBlankSessionCookie()

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )
  } catch (error: any) {
    return {
      error: error?.message,
    }
  }
}

// Verify email action
export const verifyEmail = createServerAction()
  .input(VerifyEmailSchema)
  .handler(async ({ input }) => {
    const user = await db.query.userTable.findFirst({
      where: (table) => eq(table.verifyEmailToken, input.token),
    })

    if (!user) {
      return {
        error: "Invalid token",
      }
    }

    await db.update(userTable).set({
      email: user.verifyEmailAddress || user.email,
      verifyEmailAddress: null,
      verifyEmailToken: null,
      verifyEmailTokenCreatedAt: null,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(userTable.id, user.id))

    return {
      success: "Email verified",
    }
  })

// Forgot password action
export const forgotPassword = createServerAction()
  .input(ForgotPasswordSchema)
  .handler(async ({ input }) => {
    const user = await db.query.userTable.findFirst({
      where: (table) => eq(table.email, input.email),
    })

    if (!user) {
      return {
        error: "User not found",
      }
    }

    const resetPasswordToken = generateIdFromEntropySize(10)

    await db.update(userTable).set({
      resetPasswordToken,
      resetPasswordTokenCreatedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(userTable.id, user.id))

    await sendMail({
      to: [user.email],
      subject: "Reset your password",
      html: `Reset your password by clicking on the link below:<br><a href="${env.APP_URL}/auth/reset-password?token=${resetPasswordToken}">Reset your password</a>`,
    })

    return {
      success: true,
    }
  })

// Verify reset password token action
export const verifyResetPasswordToken = createServerAction()
  .input(z.object({
    token: z.string(),
  }))
  .handler(async ({ input }) => {
    const user = await db.query.userTable.findFirst({
      where: (table) => eq(table.resetPasswordToken, input.token),
    })

    if (!user) {
      return {
        error: "Invalid token",
      }
    }

    if (user.resetPasswordTokenCreatedAt && user.resetPasswordTokenCreatedAt.getTime() + 60 * 60 * 24 * 1000 < Date.now()) {
      return {
        error: "Token expired",
      }
    }

    return {
      success: true,
    }
  })

// Reset password action
export const resetPassword = createServerAction()
  .input(ResetPasswordSchema)
  .handler(async ({ input }) => {
    const user = await db.query.userTable.findFirst({
      where: (table) => eq(table.resetPasswordToken, input.token),
    })

    if (!user) {
      return {
        error: "Invalid token",
      }
    }

    // Hash the password
    const hashedPassword = await argon2.hash(input.password)

    // Update the user's password
    await db.update(userTable).set({
      hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenCreatedAt: null,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(userTable.id, user.id))

    return {
      success: true,
    }
  })

// Update profile action
export const updateProfile = createServerAction()
  .input(ProfileSchema)
  .handler(async ({ input }) => {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      }
    }

    const userDb = await db.query.userTable.findFirst({
      where: (table) => eq(table.id, user.id),
    })

    if (!userDb) {
      return {
        error: "User not found",
      }
    }

    if (userDb.email !== input.email && userDb.authProvider === "password") {
      if (env.ENABLE_MAIL_SERVICE === true && env.AUTH_SEND_VERIFICATION_EMAIL === true) {
        //userDb.email = input.email // We don't update the email, we just send a verification email
        userDb.verifyEmailAddress = input.email
        userDb.verifyEmailToken = generateIdFromEntropySize(10)
        userDb.verifyEmailTokenCreatedAt = new Date()
      } else {
        userDb.email = input.email
      }
    }

    if (userDb.email !== input.email && userDb.authProvider !== "password") {
      return {
        error: "Email cannot be updated if the user is using a social provider",
      }
    }

    if (userDb.username !== input.username) {
      userDb.username = input.username
    }

    console.log(input.avatar)
    if (input.avatar && userDb.avatarUrl !== input.avatar) {
      userDb.avatarUrl = input.avatar
    }

    try {
      await db.update(userTable).set({
        email: userDb.email,
        username: userDb.username,
        updatedAt: new Date(),
        verifyEmailAddress: input.email,
        verifyEmailToken: userDb.verifyEmailToken,
        verifyEmailTokenCreatedAt: new Date(),
        avatarUrl: userDb.avatarUrl,
      }).where(eq(userTable.id, user.id))
    } catch (error: any) {
      // Check if the error is a duplicate email or username
      if (error?.message.includes("duplicate key value")) {
        if (error?.message.includes("user_email_unique")) {
          return {
            error: "Email already exists. Please sign in.",
          }
        }
        if (error?.message.includes("user_username_unique")) {
          return {
            error: "Username already exists. Please choose another one.",
          }
        }
      }

      return {
        error: error?.message,
      }
    }


    if (userDb.email !== input.email && userDb.authProvider === "password" && env.ENABLE_MAIL_SERVICE === true && env.AUTH_SEND_VERIFICATION_EMAIL === true) {
      await sendMail({
        to: [input.email],
        subject: "Verify your email",
        html: `You changed your email!<br><br>Please verify your email by clicking on the link below:<br><a href="${env.APP_URL}/auth/verify-email?token=${userDb.verifyEmailToken}">Verify your email</a>`,
      })
    }

    return {
      success: true,
      newEmail: userDb.email !== input.email, // We notify the user that the email has been updated
    }
  })
