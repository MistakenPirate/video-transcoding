// src/queue/videoQueue.ts
import { Queue } from "bullmq";

const videoQueue = new Queue("video-transcode", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

export default videoQueue;
