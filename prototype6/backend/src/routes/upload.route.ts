import { Router, Request, Response } from "express";
import { upload } from "../utils/storage";
import videoQueue from "../queue/videoQueue";
import path from "path";
import { uploadFileToS3 } from "../utils/uploadToS3";
import { uploadDir } from "../config/paths";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { metaDb, outboxDB } from "../db/schema";


const router = Router();

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const uploadId = uuidv4();
  console.log("*****")
  const s3Key = `uploads/${uploadId}/original.mp4`;
  const bucket = "uploaded_videos";
  const localPath = path.join(uploadDir, req.file.filename);
    console.log("*****")

  // Upload to S3 (MinIO)
  await uploadFileToS3(localPath, s3Key);
  console.log("*****")


    await db.transaction(async (tx) => {
  // Insert into meta_db
  const [video] = await tx
    .insert(metaDb)
    .values({
      uploadId,                       
      filename: req.file?.originalname || "unknown",
      s3Key,                        
      s3Bucket: bucket,    
      status: "uploaded",
    })
    .returning({ id: metaDb.id, uploadId: metaDb.uploadId });

  // Insert into outboxDB (mirroring meta info)
  await tx.insert(outboxDB).values({
    uploadId: video?.uploadId,     
    filename: req.file?.originalname || "unknown",
    s3Key,
    s3Bucket: bucket,
    uploadedAt: new Date(),
  });
});


  // const job = await videoQueue.add("transcode", {
  //   filename: req.file.filename,
  //   filepath: req.file.path,
  // });
  console.log("*****")

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
