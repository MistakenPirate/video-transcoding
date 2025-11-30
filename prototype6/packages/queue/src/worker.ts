import { Worker } from "bullmq";

export const createVideoWorker = (processor: (job: any) => Promise<any>) => {
  return new Worker(
    "video",
    processor,
    {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
      concurrency: parseInt(process.env.WORKER_CONCURRENCY || "1"),
    }
  );
};

