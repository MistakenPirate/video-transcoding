import { GetObjectCommand } from "@aws-sdk/client-s3";
import { db, metaDb } from "@video-transcoding/db";
import { s3Client } from "@video-transcoding/s3";
import { desc, eq } from "drizzle-orm";
import { Request, Response, Router } from "express";

const router = Router();

// GET /videos - List current user's videos
router.get("/", async (req: Request, res: Response) => {
  try {
    const videos = await db
      .select({
        uploadId: metaDb.uploadId,
        filename: metaDb.filename,
        status: metaDb.status,
        jobId: metaDb.jobId,
        uploadedAt: metaDb.uploadedAt,
      })
      .from(metaDb)
      .where(eq(metaDb.userId, req.user!.userId))
      .orderBy(desc(metaDb.uploadedAt));

    res.json({ videos });
  } catch (error) {
    console.error("List videos error:", error);
    res.status(500).json({ error: "Failed to list videos" });
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
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");

    // Pipe the S3 stream to the response
    const stream = response.Body as NodeJS.ReadableStream;
    stream.pipe(res);
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httptatusCode === 404) {
      return res.status(404).json({ error: "File not found" });
    }
    console.error("Stream error:", error);
    res.status(500).json({ error: "Failed to stream video" });
  }
});

export default router;
