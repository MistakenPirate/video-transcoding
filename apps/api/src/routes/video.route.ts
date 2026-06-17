import { GetObjectCommand } from "@aws-sdk/client-s3";
import { db, metaDb } from "@video-transcoding/db";
import { deleteObject, deletePrefix, s3Client } from "@video-transcoding/s3";
import { and, desc, eq, sql } from "drizzle-orm";
import { Request, Response, Router } from "express";

const router: Router = Router();

// GET /videos - List current user's videos
router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string, 10) || 20, 1),
      100,
    );
    const offset = Math.max(parseInt(req.query.offset as string, 10) || 0, 0);
    const q = (req.query.q as string | undefined)?.trim();

    const ownedByUser = eq(metaDb.userId, req.user!.userId);
    // When searching, match either a literal substring (so "cons" finds
    // "consistent") OR a fuzzy word match (so typos like "konsis" still hit).
    // word_similarity compares the query against the closest substring of the
    // filename, unlike plain similarity() which scores against the whole string.
    // Both use the GIN trigram index. Order by closeness; else newest first.
    const likePattern = q ? `%${q.replace(/[\\%_]/g, "\\$&")}%` : "";
    const where = q
      ? and(
          ownedByUser,
          sql`(${metaDb.filename} ILIKE ${likePattern} OR ${q} <% ${metaDb.filename})`,
        )
      : ownedByUser;
    const orderBy = q
      ? desc(sql`word_similarity(${q}, ${metaDb.filename})`)
      : desc(metaDb.uploadedAt);

    // Fetch one extra row to determine whether more pages exist
    // without running a separate COUNT query.
    const rows = await db
      .select({
        uploadId: metaDb.uploadId,
        filename: metaDb.filename,
        status: metaDb.status,
        jobId: metaDb.jobId,
        uploadedAt: metaDb.uploadedAt,
      })
      .from(metaDb)
      .where(where)
      .orderBy(orderBy)
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const videos = hasMore ? rows.slice(0, limit) : rows;

    res.json({
      videos,
      pagination: {
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + limit : null,
      },
    });
  } catch (error) {
    console.error("List videos error:", error);
    res.status(500).json({ error: "Failed to list videos" });
  }
});

// DELETE /videos/:uploadId - Delete a video and all its underlying S3 objects
router.delete("/:uploadId", async (req: Request, res: Response) => {
  const { uploadId } = req.params;

  try {
    // Ownership check: only fetch a row that belongs to the current user.
    const [video] = await db
      .select({
        uploadId: metaDb.uploadId,
        jobId: metaDb.jobId,
        s3Key: metaDb.s3Key,
        s3Bucket: metaDb.s3Bucket,
      })
      .from(metaDb)
      .where(
        and(eq(metaDb.uploadId, uploadId), eq(metaDb.userId, req.user!.userId)),
      );

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Remove transcoded output (master playlist, per-resolution playlists,
    // every .ts segment, thumbnail) which all live under videos/{jobId}/.
    if (video.jobId) {
      const outputBucket =
        process.env.OUTPUT_BUCKET || process.env.S3_BUCKET || "uploaded-videos";
      await deletePrefix(outputBucket, `videos/${video.jobId}/`);
    }

    // Remove the original uploaded file.
    if (video.s3Key && video.s3Bucket) {
      await deleteObject(video.s3Bucket, video.s3Key);
    }

    // Delete the DB row (cascades to outbox via the uploadId foreign key).
    await db.delete(metaDb).where(eq(metaDb.uploadId, uploadId));

    res.json({ success: true });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

// GET /videos/stream/:jobId/*path - Proxy HLS content from MinIO
router.get("/stream/:jobId/*path", async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const rawPath = req.params.path;
  const filePath = Array.isArray(rawPath) ? rawPath.join("/") : rawPath;

  if (!jobId || !filePath) {
    return res.status(400).json({ error: "Invalid path" });
  }

  const s3Key = `videos/${jobId}/${filePath}`;
  const bucket =
    process.env.OUTPUT_BUCKET || process.env.S3_BUCKET || "uploaded-videos";

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    const response = await s3Client.send(command);

    // Set appropriate content type
    if (filePath.endsWith(".m3u8")) {
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    } else if (filePath.endsWith(".ts")) {
      res.setHeader("Content-Type", "video/mp2t");
    } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg");
    } else if (filePath.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png");
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");

    // Pipe the S3 stream to the response
    const stream = response.Body as NodeJS.ReadableStream;
    stream.pipe(res);
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ error: "File not found" });
    }
    console.error("Stream error:", error);
    res.status(500).json({ error: "Failed to stream video" });
  }
});

export default router;
