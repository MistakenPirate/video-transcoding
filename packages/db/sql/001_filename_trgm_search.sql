-- Enable typo-tolerant fuzzy search on meta_db.filename via trigram similarity.
-- Run once against the database:
--   psql "$DATABASE_URL" -f packages/db/sql/001_filename_trgm_search.sql

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram index keeps `filename % :q` and similarity() fast as the table grows.
CREATE INDEX IF NOT EXISTS meta_db_filename_trgm
  ON meta_db USING gin (filename gin_trgm_ops);
