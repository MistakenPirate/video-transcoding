CREATE TABLE "meta_db" (
	"id" serial PRIMARY KEY NOT NULL,
	"upload_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"s3_key" text NOT NULL,
	"s3_bucket" varchar(255) DEFAULT 'videos' NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'queued' NOT NULL,
	CONSTRAINT "meta_db_upload_id_unique" UNIQUE("upload_id")
);
--> statement-breakpoint
CREATE TABLE "outbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"upload_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"s3_key" text NOT NULL,
	"s3_bucket" varchar(255) DEFAULT 'videos' NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "outbox_upload_id_unique" UNIQUE("upload_id")
);
