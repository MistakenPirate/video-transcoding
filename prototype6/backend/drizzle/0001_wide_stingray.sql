ALTER TABLE "meta_db" ALTER COLUMN "s3_bucket" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "outbox" ALTER COLUMN "s3_bucket" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "meta_db" ADD COLUMN "file_hash" varchar(64) NOT NULL;