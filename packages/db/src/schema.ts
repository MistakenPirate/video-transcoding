import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Users table
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").defaultRandom().notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Refresh tokens table
export const refreshTokensTable = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  tokenId: uuid("token_id").defaultRandom().notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.userId, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

export const metaDb = pgTable("meta_db", {
  id: serial("id").primaryKey(),
  uploadId: uuid("upload_id").defaultRandom().notNull().unique(),
  userId: uuid("user_id").references(() => usersTable.userId, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileHash: varchar("file_hash", { length: 64 }).notNull(),
  s3Key: text("s3_key").notNull(),
  s3Bucket: varchar("s3_bucket", { length: 255 }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).default("queued").notNull(),
  jobId: varchar("job_id", { length: 255 }),
});

export const outboxDB = pgTable("outbox", {
  id: serial("id").primaryKey(),
  uploadId: uuid("upload_id")
    .notNull()
    .references(() => metaDb.uploadId, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  filename: varchar("filename", { length: 255 }).notNull(),
  s3Key: text("s3_key").notNull(),
  s3Bucket: varchar("s3_bucket", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  error: text("error"),
  jobId: varchar("job_id", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

