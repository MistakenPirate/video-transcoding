import dotenv from "dotenv";
import { join, resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env") });

import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { db, metaDb } from "@video-transcoding/db";
import { createVideoWorker } from "@video-transcoding/queue";
import s3Client from "@video-transcoding/s3";
import { eq } from "drizzle-orm";
import ffmpeg from "fluent-ffmpeg";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { pipeline } from "stream/promises";

const BUCKET_NAME = process.env.S3_BUCKET || "uploaded-videos";
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET || BUCKET_NAME;
const TEMP_DIR = process.env.TEMP_DIR || join(__dirname, "../../../temp");
const OUTPUT_DIR =
  process.env.OUTPUT_DIR || join(__dirname, "../../../outputs");

// Ensure temp and output directories exist
[TEMP_DIR, OUTPUT_DIR].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

interface TranscodeJob {
  uploadId: string;
  filename: string;
  s3Key: string;
  bucket: string;
}

const RESOLUTIONS = [
  { name: "360p", width: 640, height: 360, bitrate: "800k" },
  { name: "480p", width: 854, height: 480, bitrate: "1400k" },
  // { name: "720p", width: 1280, height: 720, bitrate: "2800k" },
  // { name: "1080p", width: 1920, height: 1080, bitrate: "5000k" },
];

async function downloadFromS3(s3Key: string, localPath: string): Promise<void> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const response = await s3Client.send(command);
  if (!response.Body) {
    throw new Error("No body in S3 response");
  }

  const writeStream = createWriteStream(localPath);
  await pipeline(response.Body as any, writeStream);
}

async function uploadToS3(
  localPath: string,
  s3Key: string,
  retries = 3,
): Promise<void> {
  const { createReadStream } = await import("fs");

  if (s3Key.endsWith(".mp4")) {
    const fs = await import("fs");

    try {
      const buffer = fs.readFileSync(localPath);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: OUTPUT_BUCKET,
          Key: s3Key,
          Body: buffer,
        }),
      );

      return;
    } catch (err: any) {
      if (err?.$metadata?.httpStatusCode === 503 && retries > 0) {
        console.log("Retrying MP4 upload...", retries);

        await new Promise((r) => setTimeout(r, 700));
        return uploadToS3(localPath, s3Key, retries - 1);
      }

      throw err;
    }
  }

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: OUTPUT_BUCKET,
        Key: s3Key,
        Body: createReadStream(localPath),
      },
      queueSize: 1,
      partSize: 5 * 1024 * 1024,
    });

    await upload.done();
  } catch (err: any) {
    if (err?.$metadata?.httpStatusCode === 503 && retries > 0) {
      console.log("Retrying upload...", retries);

      await new Promise((r) => setTimeout(r, 500));
      return uploadToS3(localPath, s3Key, retries - 1);
    }

    throw err;
  }
}

function transcodeToHLS(
  inputPath: string,
  outputDir: string,
  jobId: string,
  resolution: { name: string; width: number; height: number; bitrate: string },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputPath = join(outputDir, resolution.name);
    const playlistPath = join(outputPath, "index.m3u8");
    const segmentPath = join(outputPath, "seg_%03d.ts");

    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .size(`${resolution.width}x${resolution.height}`)
      .videoBitrate(resolution.bitrate)
      .audioBitrate("128k")
      .format("hls")
      .outputOptions([
        "-pix_fmt yuv420p",
        "-profile:v baseline",
        "-level 3.1",
        "-hls_time 10",
        "-hls_list_size 0",
        "-hls_segment_filename",
        segmentPath,
        "-start_number 0",
      ])
      .output(playlistPath)
      .on("start", (commandLine) => {
        console.log(`FFmpeg started for ${resolution.name}: ${commandLine}`);
      })
      .on("progress", (progress) => {
        console.log(
          `Processing ${resolution.name}: ${progress.percent?.toFixed(2)}% done`,
        );
      })
      .on("end", () => {
        console.log(`Finished transcoding ${resolution.name}`);
        resolve();
      })
      .on("error", (err) => {
        console.error(`Error transcoding ${resolution.name}:`, err);
        reject(err);
      })
      .run();
  });
}

function createMasterPlaylist(outputDir: string, jobId: string): string {
  const playlists = RESOLUTIONS.map((res) => {
    return `#EXT-X-STREAM-INF:BANDWIDTH=${res.bitrate.replace("k", "000")},RESOLUTION=${res.width}x${res.height}\n${res.name}/index.m3u8`;
  });

  const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:3
${playlists.join("\n")}
`;

  return masterPlaylist;
}

async function cleanupDirectory(dir: string): Promise<void> {
  if (existsSync(dir)) {
    const files = readdirSync(dir, { recursive: true });
    for (const file of files) {
      const filePath = join(dir, file);
      try {
        rmSync(filePath, { recursive: true, force: true });
      } catch (err) {
        console.warn(`Failed to delete ${filePath}:`, err);
      }
    }
  }
}

async function processTranscodeJob(job: any): Promise<void> {
  const { uploadId, filename, s3Key, bucket } = job.data as TranscodeJob;
  const jobId = job.id;

  console.log(`Starting transcoding job ${jobId} for upload ${uploadId}`);

  const tempInputPath = join(TEMP_DIR, `${jobId}-input.mp4`);
  const outputDir = join(OUTPUT_DIR, jobId.toString());

  try {
    // Update status to processing
    await db
      .update(metaDb)
      .set({ status: "processing" })
      .where(eq(metaDb.uploadId, uploadId));

    // Download video from S3
    console.log(`Downloading ${s3Key} from S3...`);
    await downloadFromS3(s3Key, tempInputPath);
    console.log("Download complete");

    // Create output directory
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Transcode to multiple resolutions
    let completedResolutions = 0;
    const totalResolutions = RESOLUTIONS.length;

    for (const resolution of RESOLUTIONS) {
      const resolutionOutputDir = join(outputDir, resolution.name);
      if (!existsSync(resolutionOutputDir)) {
        mkdirSync(resolutionOutputDir, { recursive: true });
      }

      await transcodeToHLS(
        tempInputPath,
        outputDir,
        jobId.toString(),
        resolution,
      );
      completedResolutions++;

      // Update progress
      const progress = Math.round(
        (completedResolutions / totalResolutions) * 90,
      ); // 90% for transcoding
      await job.updateProgress(progress);
    }

    // Upload HLS files to S3
    console.log("Uploading HLS files to S3...");
    const filesToUpload: Array<{ local: string; remote: string }> = [];

    // Collect all files
    for (const resolution of RESOLUTIONS) {
      const resolutionDir = join(outputDir, resolution.name);
      const files = readdirSync(resolutionDir);
      for (const file of files) {
        filesToUpload.push({
          local: join(resolutionDir, file),
          remote: `videos/${jobId}/${resolution.name}/${file}`,
        });
      }
    }

    // Upload files
    for (const { local, remote } of filesToUpload) {
      await uploadToS3(local, remote);
    }

    // Create and upload master playlist
    const masterPlaylist = createMasterPlaylist(outputDir, jobId.toString());
    const masterPlaylistPath = join(outputDir, "master.m3u8");
    writeFileSync(masterPlaylistPath, masterPlaylist);
    await uploadToS3(masterPlaylistPath, `videos/${jobId}/master.m3u8`);

    // Update status to completed
    await db
      .update(metaDb)
      .set({ status: "completed" })
      .where(eq(metaDb.uploadId, uploadId));

    await job.updateProgress(100);
    console.log(`Job ${jobId} completed successfully`);

    // Cleanup temporary files
    await cleanupDirectory(outputDir);
    if (existsSync(tempInputPath)) {
      rmSync(tempInputPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);

    // Update status to failed
    await db
      .update(metaDb)
      .set({ status: "failed" })
      .where(eq(metaDb.uploadId, uploadId));

    // Cleanup on error
    if (existsSync(tempInputPath)) {
      rmSync(tempInputPath, { recursive: true, force: true });
    }
    await cleanupDirectory(outputDir);

    throw error;
  }
}

// Create and start worker
const worker = createVideoWorker(async (job) => {
  await processTranscodeJob(job);
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down transcoder...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down transcoder...");
  await worker.close();
  process.exit(0);
});

console.log("Transcoder Worker Started...");
console.log(`Processing jobs from queue: video`);
console.log(`Concurrency: ${process.env.WORKER_CONCURRENCY || 1}`);
