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
    console.log("Processing file:", filepath);
    console.log("File exists?", fs.existsSync(filepath));

    const jobId = job.id;

    // Convert input path to Windows-safe forward slashes (no quotes!)
const safeInput = filepath.replace(/\\/g, "/");

for (const r of renditions) {
  const renditionDir = path.join(outputDir, `${jobId}_${r.name}`).replace(/\s/g, "_");
  fs.mkdirSync(renditionDir, { recursive: true });

  // Forward slashes for FFmpeg
  const segmentPath = path.join(renditionDir, "seg_%03d.ts").replace(/\\/g, "/");
  const outputPath = path.join(renditionDir, "index.m3u8").replace(/\\/g, "/");

  await new Promise((resolve, reject) => {
    ffmpeg(safeInput)
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
        `-hls_segment_filename ${segmentPath}`,
        "-hls_flags delete_segments+append_list",
      ])
      .output(outputPath)
      .on("start", (cmd) => console.log("FFmpeg cmd:", cmd))
      .on("stderr", (line) => console.error("FFmpeg stderr:", line))
      .on("end", resolve)
      .on("error", reject)
      .run();
  });


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
    }

    // Master playlist
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

    const masterPath = path.join(outputDir, `${jobId}-master.m3u8`);
    fs.writeFileSync(masterPath, masterPlaylist);

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

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});
