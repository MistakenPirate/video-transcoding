import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../../packages/db/src/schema.ts",
  out: "./src/db/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/video_transcoding",
  },
});
