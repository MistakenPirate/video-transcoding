import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../../.env") });

import { sql } from "drizzle-orm";
import { db } from "@video-transcoding/db";

async function addMissingColumns() {
  console.log("🔧 Adding missing columns to existing tables...\n");

  try {
    // Add job_id to meta_db
    console.log("Adding job_id to meta_db...");
    await db.execute(sql`
      ALTER TABLE meta_db
      ADD COLUMN IF NOT EXISTS job_id VARCHAR(255)
    `);

    // Add missing columns to outbox
    console.log("Adding status to outbox...");
    await db.execute(sql`
      ALTER TABLE outbox
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
    `);

    console.log("Adding error to outbox...");
    await db.execute(sql`
      ALTER TABLE outbox
      ADD COLUMN IF NOT EXISTS error TEXT
    `);

    console.log("Adding job_id to outbox...");
    await db.execute(sql`
      ALTER TABLE outbox
      ADD COLUMN IF NOT EXISTS job_id VARCHAR(255)
    `);

    console.log("Adding updated_at to outbox...");
    await db.execute(sql`
      ALTER TABLE outbox
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    // Add indexes
    console.log("\n📊 Creating indexes...");
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_meta_db_job_id ON meta_db(job_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_meta_db_status ON meta_db(status)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_outbox_job_id ON outbox(job_id)
    `);

    console.log("\n✅ All columns and indexes added successfully!");
    console.log("\n🔍 Verifying changes...\n");

    // Verify meta_db
    const metaCols = await db.execute(sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'meta_db'
      ORDER BY ordinal_position
    `);
    console.log("meta_db columns:");
    metaCols.rows.forEach((col: any) => {
      console.log(`  ✓ ${col.column_name} (${col.data_type})`);
    });

    // Verify outbox
    const outboxCols = await db.execute(sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'outbox'
      ORDER BY ordinal_position
    `);
    console.log("\noutbox columns:");
    outboxCols.rows.forEach((col: any) => {
      console.log(`  ✓ ${col.column_name} (${col.data_type})`);
    });

    console.log("\n✨ Migration complete! You can now start the worker.\n");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

addMissingColumns();

