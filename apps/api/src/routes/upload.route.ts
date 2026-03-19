import { eq } from "drizzle-orm";
import { Request, Response, Router } from "express";
import path from "path";
import { uploadDir } from "../config/paths";
import { db, metaDb, outboxDB } from "@video-transcoding/db";
import { computeFileHash } from "../utils/computeHash";
import { upload } from "../utils/storage";
import { uploadFileToS3 } from "../utils/uploadToS3";

const router = Router();

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const localPath = path.join(uploadDir, req.file.filename);

  try {
    const fileHash = await computeFileHash(localPath);
    console.log("File hash:", fileHash);

    const existing = await db
      .select()
      .from(metaDb)
      .where(eq(metaDb.fileHash, fileHash))
      .limit(1);

    if (existing.length > 0) {
      console.log("Duplicate upload detected skipping S3 upload.");
      return res.json({
        uploadId: existing[0]?.uploadId,
        message: "This video already exists in the system.",
        duplicate: true,
      });
    }
    const s3Key = `uploads/${fileHash}/original.mp4`;
    const bucket = process.env.S3_BUCKET || "uploaded-videos";

    await uploadFileToS3(localPath, s3Key);
    console.log("*****");

    const result = await db.transaction(async (tx) => {
      const [video] = await tx
        .insert(metaDb)
        .values({
          userId: req.user!.userId,
          filename: req.file!.originalname,
          fileHash,
          s3Key,
          s3Bucket: bucket,
          status: "uploaded",
        })
        .returning({ id: metaDb.id, uploadId: metaDb.uploadId });

      if (!video) {
        throw new Error("Failed to insert video metadata");
      }

      await tx.insert(outboxDB).values({
        uploadId: video?.uploadId,
        filename: req.file!.originalname,
        s3Key,
        s3Bucket: bucket,
        status: "pending",
      });
      return video;
    });

    res.json({
      uploadId: result.uploadId,
      message: "File uploaded and queued for processing",
      status: "uploaded",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "Upload failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/status/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Upload ID is required" });
  }

  const [video] = await db
    .select()
    .from(metaDb)
    .where(eq(metaDb.uploadId, id))
    .limit(1);

  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  const response: Record<string, any> = {
    uploadId: video.uploadId,
    status: video.status,
    filename: video.filename,
  };

  if (video.status === "completed" && video.jobId) {
    response.masterPlaylist = `http://localhost:9000/videos/${video.jobId}/master.m3u8`;
  }

  res.json(response);
});

export default router;

