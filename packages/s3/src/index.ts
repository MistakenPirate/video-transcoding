import { S3Client } from "@aws-sdk/client-s3";

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

import {
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const BUCKET = "uploaded-videos";

export async function ensureBucketExists(s3: S3Client) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch (err) {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    console.log("Bucket created:", BUCKET);
  }
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

// Delete every object under a prefix, handling pagination (>1000 keys) and
// the 1000-key-per-request limit of DeleteObjects.
export async function deletePrefix(
  bucket: string,
  prefix: string,
): Promise<void> {
  let continuationToken: string | undefined;
  do {
    const listed = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    const objects = (listed.Contents ?? [])
      .map((o) => o.Key)
      .filter((k): k is string => Boolean(k))
      .map((Key) => ({ Key }));

    if (objects.length > 0) {
      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: objects },
        }),
      );
    }

    continuationToken = listed.IsTruncated
      ? listed.NextContinuationToken
      : undefined;
  } while (continuationToken);
}

export default s3Client;
