const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs")
const {v4: uuidV4} = require("uuid")

const videoQueue = require("./queue")

const PORT = process.env.PORT || 3000;


const uploadDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "outputs");

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Server is up!" });
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const job = await videoQueue.add("transcode", {
    filename: req.file.filename,
    filepath: req.file.path,
  });
  res.json({ jobId: job.id, status: "queued" });
});

app.get("/status/:id", async (req, res) => {
  const job = await videoQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const state = await job.getState();
  const progress = job.progress;

  const response = {
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


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

/*
Prototype 5:
- In this prototype, each video is transcoded into multiple HLS renditions (360p, 480p, 720p, 1080p).
- Each rendition has its own `.m3u8` playlist and segments.
- A master playlist (`master.m3u8`) is generated, which references all renditions.
- `/status/:id` returns playback URLs for both the master playlist and individual renditions.
*/
