import { Queue } from "bullmq";

export const videoQueue = new Queue("video", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

export default videoQueue;
export * from "./worker";

