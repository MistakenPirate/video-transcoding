const { Worker } = require("bullmq");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("./s3Client");

const BUCKET = "videos";
const outputDir = path.join(__dirname, "outputs");

fs.mkdirSync(outputDir, { recursive: true });

const worker = new Worker(
  "video-transcode",
  async (job) => {
    const { filename, filepath } = job.data;
    const outputFilename = `${filename}-720p.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    return new Promise((resolve, reject) => {
      ffmpeg(filepath)
        .outputOptions([
          "-vf scale=-2:720",
          "-c:v libx264",
          "-preset fast",
          "-crf 23",
          "-c:a aac",
          "-b:a 128k",
        ])
        .save(outputPath)
        .on("progress", (progress) => {
          job.updateProgress(progress.percent || 0);
        })
        .on("end", async () => {
          try {
            const fileStream = fs.createReadStream(outputPath);
            await s3.send(
              new PutObjectCommand({
                Bucket: BUCKET,
                Key: outputFilename,
                Body: fileStream,
                ContentType: "video/mp4",
              })
            );
            resolve({ outputFilename });
          } catch (err) {
            reject(err);
          }
        })
        .on("error", (err) => reject(err));
    });
  },
  { connection: { host: "localhost", port: 6379 } }
);

console.log("Worker is running...");
