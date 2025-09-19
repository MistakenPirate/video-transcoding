const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "us-east-1", // arbitrary, MinIO doesn’t check
  endpoint: "http://localhost:9000",
  forcePathStyle: true, // required for MinIO
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
});

module.exports = s3;
