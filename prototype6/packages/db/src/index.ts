import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Hardcoded DATABASE_URL for now
const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/video_transcoding";

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Disable SSL for local PostgreSQL (Docker)
  ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
export * from "./schema";

