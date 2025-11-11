import { pgTable, serial, text, timestamp, varchar, uuid } from "drizzle-orm/pg-core";

export const metaDb = pgTable("meta_db", {
  id: serial("id").primaryKey(),
  uploadId: uuid("upload_id").defaultRandom().notNull().unique(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileHash: varchar("file_hash", { length: 64 }).notNull(),
  s3Key: text("s3_key").notNull(), 
  s3Bucket: varchar("s3_bucket", { length: 255 }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).default("queued").notNull(),
});


export const outboxDB = pgTable("outbox", {
  id: serial("id").primaryKey(),
  uploadId: uuid("upload_id").defaultRandom().notNull().unique(),
  filename: varchar("filename", { length: 255 }).notNull(),
  s3Key: text("s3_key").notNull(), 
  s3Bucket: varchar("s3_bucket", { length: 255 }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});
