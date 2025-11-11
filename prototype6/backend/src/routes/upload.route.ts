import { Router, Request, Response } from "express";
import { upload } from "../utils/storage";
import videoQueue from "../queue/videoQueue";
import path from "path";
import { uploadFileToS3 } from "../utils/uploadToS3";
import { uploadDir } from "../config/paths";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { metaDb, outboxDB } from "../db/schema";
import { computeFileHash } from "../utils/computeHash";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const uploadId = uuidv4();

  const localPath = path.join(uploadDir, req.file.filename);

  const fileHash = await computeFileHash(localPath);
  console.log("File hash:", fileHash);

  const existing = await db
    .select()
    .from(metaDb)
    .where(eq(metaDb.fileHash, fileHash));

  if (existing.length > 0) {
    console.log("Duplicate upload detected skipping S3 upload.");
    return res.json({
      uploadId: existing[0]?.uploadId,
      message: "This video already exists in the system.",
      duplicate: true,
    });
  }

  const s3Key = `uploads/${fileHash}/original.mp4`;
  const bucket = "uploaded_videos";

  // Upload to S3 (MinIO)
  await uploadFileToS3(localPath, s3Key);
  console.log("*****");

  try {
    // throw new Error("Testing transaction failure");
    await db.transaction(async (tx) => {
      // Insert into meta_db
      const [video] = await tx
        .insert(metaDb)
        .values({
          uploadId,
          filename: req.file?.originalname || "unknown",
          fileHash,
          s3Key,
          s3Bucket: bucket,
          status: "uploaded",
        })
        .returning({ id: metaDb.id, uploadId: metaDb.uploadId });

      await tx.insert(outboxDB).values({
        uploadId: video?.uploadId,
        filename: req.file?.originalname || "unknown",
        s3Key,
        s3Bucket: bucket,
        uploadedAt: new Date(),
      });
    });
  } catch (error) {
    console.error("Database transaction failed:", error);
    return res.status(500).json({
      error: "File uploaded but database save failed. Retry will reconcile.",
    });
  }

  // const job = await videoQueue.add("transcode", {
  //   filename: req.file.filename,
  //   filepath: req.file.path,
  // });

  res.json({
    uploadId,
    message: "File uploaded and metadata stored successfully",
  });
});

router.get("/status/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Job ID is required" });
  }
  const job = await videoQueue.getJob(id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const state = await job.getState();
  const progress = job.progress;

  const response: Record<string, any> = {
    jobId: job.id,
    state,
    progress,
  };

  if (state === "completed") {
    response.masterPlaylist = `http://localhost:9000/videos/${job.id}/master.m3u8`;
    response.renditions = [
      `http://localhost:9000/videos/${job.id}/360p/index.m3u8`,
      `http://localhost:9000/videos/${job.id}/480p/index.m3u8`,
      `http://localhost:9000/videos/${job.id}/720p/index.m3u8`,
      `http://localhost:9000/videos/${job.id}/1080p/index.m3u8`,
    ];
  }

  res.json(response);
});

export default router;
