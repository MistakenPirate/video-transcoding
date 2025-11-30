import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found in environment variables. Make sure to load dotenv in your app entry point.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Disable SSL for local PostgreSQL (Docker)
  ssl: process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
export * from "./schema";

