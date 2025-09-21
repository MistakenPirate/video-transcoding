const { Worker } = require("bullmq");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("./s3Client");

const BUCKET = "videos";
const outputDir = path.join(__dirname, "outputs");

fs.mkdirSync(outputDir, { recursive: true });

const renditions = [
  { name: "360p", scale: "640:360", bitrate: "800k" },
  { name: "480p", scale: "854:480", bitrate: "1400k" },
  { name: "720p", scale: "1280:720", bitrate: "2800k" },
  { name: "1080p", scale: "1920:1080", bitrate: "5000k" },
];

const worker = new Worker(
  "video-transcode",
  async (job) => {
    const { filename, filepath } = job.data;
    const jobId = job.id;

    // Transcode each rendition
    for (const r of renditions) {
      const renditionDir = path.join(outputDir, `${jobId}-${r.name}`);
      fs.mkdirSync(renditionDir, { recursive: true });

      await new Promise((resolve, reject) => {
        ffmpeg(filepath)
          .outputOptions([
            `-vf scale=${r.scale}`,
            "-c:v libx264",
            "-preset fast",
            "-crf 23",
            `-b:v ${r.bitrate}`,
            "-c:a aac",
            "-ar 48000",
            "-b:a 128k",
            "-f hls",
            "-hls_time 6",
            "-hls_playlist_type vod",
            "-hls_segment_filename",
            path.join(renditionDir, "seg_%03d.ts"),
          ])
          .output(path.join(renditionDir, "index.m3u8"))
          .on("end", async () => {
            // Upload all files for this rendition
            const files = fs.readdirSync(renditionDir);
            for (const f of files) {
              const fileStream = fs.createReadStream(path.join(renditionDir, f));
              await s3.send(
                new PutObjectCommand({
                  Bucket: BUCKET,
                  Key: `${jobId}/${r.name}/${f}`,
                  Body: fileStream,
                })
              );
            }
            resolve();
          })
          .on("error", reject)
          .run();
      });
    }

    // Build master playlist AFTER all renditions are done
    let masterPlaylist = "#EXTM3U\n";

    for (const r of renditions) {
      const bandwidth = {
        "360p": 800000,
        "480p": 1400000,
        "720p": 2800000,
        "1080p": 5000000,
      }[r.name];

      masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${r.scale}\n`;
      masterPlaylist += `${r.name}/index.m3u8\n`;
    }

    fs.writeFileSync(path.join(outputDir, `${jobId}-master.m3u8`), masterPlaylist);

    // Upload master playlist
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: `${jobId}/master.m3u8`,
        Body: masterPlaylist,
        ContentType: "application/vnd.apple.mpegurl",
      })
    );
  },
  { connection: { host: "localhost", port: 6379 } }
);

console.log("Worker is running...");
