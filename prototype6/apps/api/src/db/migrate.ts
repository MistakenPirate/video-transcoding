import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../../.env") });

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  console.log("Running migrations...");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Disable SSL for local PostgreSQL (Docker)
    ssl: process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1') 
      ? false 
      : { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  await migrate(db, {
    migrationsFolder: resolve(__dirname, "./drizzle/migrations"),
  });

  await pool.end();

  console.log("Migrations completed successfully");
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

