import * as schema from "./schema"

import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres"

import { Pool } from "pg";
import { env } from "@/env";

const pool = new Pool({
  connectionString: env.DATABASE_URL!,
})

const db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>

export default db