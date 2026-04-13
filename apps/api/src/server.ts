import dotenv from "dotenv";
import { resolve } from "path";
import { ensureBucketExists, s3Client } from "../../../packages/s3";

dotenv.config({ path: resolve(__dirname, "../../../.env") });

import app from "./app";

const port = process.env.PORT || 8000;

async function bootstrap() {
  await ensureBucketExists(s3Client);

  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

bootstrap();
