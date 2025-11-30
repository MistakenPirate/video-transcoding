import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env") });

import { eq, inArray, sql } from "drizzle-orm";
import { db, metaDb, outboxDB } from "@video-transcoding/db";
import videoQueue from "@video-transcoding/queue";

const BATCH_SIZE = 10;
const POLL_INTERVAL = 2000; // 2 seconds

interface OutboxRow {
  id: number;
  upload_id: string;
  filename: string;
  s3_key: string;
  s3_bucket: string;
  status: string | null;
  error: string | null;
  job_id: string | null;
  uploaded_at: Date;
  updated_at: Date | null;
}

async function fetchPendingRowsWithLock(limit: number): Promise<OutboxRow[]> {
  const result = await db.execute(
    sql.raw(`
    SELECT * FROM outbox
    WHERE status = 'pending'
    ORDER BY id
    FOR UPDATE SKIP LOCKED
    LIMIT ${limit}
  `)
  );
  // @ts-ignore
  return result.rows as OutboxRow[];
}

async function processOutbox() {
  try {
    await db.transaction(async (tx) => {
      const rows = await fetchPendingRowsWithLock(BATCH_SIZE);

      if (rows.length === 0) return;

      const ids = rows.map((r) => r.id);
      const uploadIds = rows.map((r) => r.upload_id);

      await tx
        .update(outboxDB)
        .set({
          status: "processing",
          updatedAt: new Date(),
        })
        .where(inArray(outboxDB.id, ids));

      await tx
        .update(metaDb)
        .set({ status: "queued" })
        .where(inArray(metaDb.uploadId, uploadIds));

      const jobs = await Promise.all(
        rows.map((evt) =>
          videoQueue.add("transcode", {
            uploadId: evt.upload_id,
            filename: evt.filename,
            s3Key: evt.s3_key,
            bucket: evt.s3_bucket,
          })
        )
      );

      for (let i = 0; i < rows.length; i++) {
        const job = jobs[i];
        const row = rows[i];

        if (job && job.id) {
          // Update outbox with job ID
          await tx
            .update(outboxDB)
            .set({ jobId: job.id.toString() })
            .where(eq(outboxDB.id, row!.id));

          // Update meta with job ID
          await tx
            .update(metaDb)
            .set({ jobId: job.id.toString() })
            .where(eq(metaDb.uploadId, row!.upload_id));
        }
      }

      await tx
        .update(outboxDB)
        .set({
          status: "sent",
          updatedAt: new Date(),
        })
        .where(inArray(outboxDB.id, ids));

      console.log(`Processed ${rows.length} outbox entries`);
    });
  } catch (err) {
    console.error("Sweeper service error:", err);
    // need to add retry logic or dead letter queue here
  }
}

let isShuttingDown = false;
const intervalId = setInterval(async () => {
  if (!isShuttingDown) {
    await processOutbox();
  }
}, POLL_INTERVAL);

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down sweeper service...");
  isShuttingDown = true;
  clearInterval(intervalId);
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down sweeper service...");
  isShuttingDown = true;
  clearInterval(intervalId);
  process.exit(0);
});

console.log("Sweeper Service Started...");
console.log(
  `Polling every ${POLL_INTERVAL}ms for ${BATCH_SIZE} rows at a time`
);

