CREATE TABLE "meta_db" (
	"id" serial PRIMARY KEY NOT NULL,
	"upload_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"file_hash" varchar(64) NOT NULL,
	"s3_key" text NOT NULL,
	"s3_bucket" varchar(255) NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'queued' NOT NULL,
	"job_id" varchar(255),
	CONSTRAINT "meta_db_upload_id_unique" UNIQUE("upload_id")
);
--> statement-breakpoint
CREATE TABLE "outbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"upload_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"s3_key" text NOT NULL,
	"s3_bucket" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"error" text,
	"job_id" varchar(255),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_upload_id_meta_db_upload_id_fk" FOREIGN KEY ("upload_id") REFERENCES "public"."meta_db"("upload_id") ON DELETE cascade ON UPDATE cascade;

