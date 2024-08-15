import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  authProvider: text("auth_provider").notNull(),
  username: text("username").notNull().unique(),
  avatarUrl: text("avatar_url"),
  githubId: text("github_id").unique(),
  hashedPassword: text("hashed_password"),
  verifyEmailToken: text("verify_email_token"),
  verifyEmailAddress: text("verify_email_address"),
  verifyEmailTokenCreatedAt: timestamp("verify_email_token_created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordTokenCreatedAt: timestamp("reset_password_token_created_at"),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
})