import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import s3 from "../config/s3Client";

const BUCKET_NAME = "uploaded-videos";

export async function uploadFileToS3(localFilePath: string, filename: string): Promise<void> {
  const fileStream = fs.createReadStream(localFilePath);

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: fileStream,
    ContentType: "video/mp4",
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    console.log(`Uploaded ${filename} to S3 bucket "${BUCKET_NAME}"`);
  } catch (error) {
    console.error(`Failed to upload ${filename} to S3:`, error);
    throw error;
  }
}
