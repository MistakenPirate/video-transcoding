import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../../.env") });

import { sql } from "drizzle-orm";
import { db } from "@video-transcoding/db";

async function checkDatabase() {
  console.log("Checking database schema...\n");

  try {
    const tables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    console.log("Existing tables:");
    tables.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });

    // Check meta_db columns
    if (tables.rows.some((r: any) => r.table_name === "meta_db")) {
      console.log("\nmeta_db columns:");
      const metaCols = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'meta_db'
        ORDER BY ordinal_position
      `);
      metaCols.rows.forEach((col: any) => {
        console.log(
          `  - ${col.column_name} (${col.data_type}) ${
            col.is_nullable === "NO" ? "NOT NULL" : ""
          }`
        );
      });
    }

    // Check outbox columns
    if (tables.rows.some((r: any) => r.table_name === "outbox")) {
      console.log("\noutbox columns:");
      const outboxCols = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'outbox'
        ORDER BY ordinal_position
      `);
      outboxCols.rows.forEach((col: any) => {
        console.log(
          `  - ${col.column_name} (${col.data_type}) ${
            col.is_nullable === "NO" ? "NOT NULL" : ""
          }`
        );
      });
    }

    console.log("\nDatabase check complete!");
  } catch (error) {
    console.error("Error checking database:", error);
    process.exit(1);
  }

  process.exit(0);
}

checkDatabase();

