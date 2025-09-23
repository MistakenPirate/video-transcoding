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
  res.json({ jobId: job.id, state, progress: job.progress });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

/*
Prototype 4:
- In this prototype, we introduced background job processing for video transcoding
- We are using BullMQ, a Node.js job queue library that runs on top of Redis
- Now, instead of blocking the API until FFmpeg finishes, uploads are enqueued as jobs
- A separate worker service consumes the queue, processes transcoding, and uploads results to MinIO
- This makes the system non-blocking, scalable, and capable of handling multiple transcoding tasks in parallel
*/


// worker should be run separately using node worker.js