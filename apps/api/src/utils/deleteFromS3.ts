import { DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import s3Client from "@video-transcoding/s3";

const BUCKET_NAME = process.env.S3_BUCKET || "uploaded-videos";

/**
 * Delete a single file from S3
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    console.log(`Deleted file ${key} from S3 bucket "${BUCKET_NAME}"`);
  } catch (error) {
    console.error(`Failed to delete file ${key} from S3:`, error);
    throw error;
  }
}

/**
 * Delete all files under a prefix (folder-like structure)
 * Useful for transcoded HLS outputs
 */
export async function deleteFolderFromS3(prefix: string): Promise<void> {
  try {
    const listedObjects = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
      })
    );

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log(`No objects found for prefix ${prefix}`);
      return;
    }

    const objectsToDelete = listedObjects.Contents.map((obj) => ({
      Key: obj.Key!,
    }));

    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: objectsToDelete,
        },
      })
    );

    console.log(`Deleted folder ${prefix} from S3 bucket "${BUCKET_NAME}"`);
  } catch (error) {
    console.error(`Failed to delete folder ${prefix} from S3:`, error);
    throw error;
  }
}