import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  forcePathStyle: true, // required for MinIO
  credentials: {
    accessKeyId:
      process.env.MINIO_ACCESS_KEY ||
      process.env.AWS_ACCESS_KEY_ID ||
      "minioadmin",
    secretAccessKey:
      process.env.MINIO_SECRET_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      "minioadmin",
  },
});

const BUCKET = "uploaded-videos";

export async function ensureBucketExists(s3: S3Client) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch (err) {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    console.log("Bucket created:", BUCKET);
  }
}

export default s3Client;
