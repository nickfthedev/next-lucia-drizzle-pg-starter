import { defineConfig } from "drizzle-kit"
import { env } from "@/env"

export default defineConfig({
  schema: "./src/lib/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
})