# Video Transcoding Monorepo

A Turborepo monorepo for video transcoding services with separate API and worker services.

## Structure

```
prototype6/
├── apps/
│   ├── api/          # Main API server (Express)
│   ├── sweeper/      # Sweeper service (outbox pattern worker)
│   └── transcoder/   # Video transcoder worker (HLS conversion)
├── packages/
│   ├── db/           # Shared database schema and connection
│   ├── queue/        # Shared BullMQ queue configuration
│   └── s3/           # Shared S3 client configuration
├── package.json      # Root package.json with Turborepo
└── turbo.json        # Turborepo configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm (recommended) or npm/yarn
- PostgreSQL database
- Redis (for BullMQ)

### Installation

```bash
# Install dependencies for all packages
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Or create a `.env` file in the root directory with:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/video_transcoding
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
S3_BUCKET=uploaded-videos
OUTPUT_BUCKET=uploaded-videos
S3_ENDPOINT=http://localhost:9000
WORKER_CONCURRENCY=1
```

### Development

Run all services in development mode:

```bash
pnpm dev
```

Run specific services:

```bash
# API only
pnpm --filter @video-transcoding/api dev

# Sweeper only
pnpm --filter @video-transcoding/sweeper dev

# Transcoder only
pnpm --filter @video-transcoding/transcoder dev
```

### Building

Build all packages:

```bash
pnpm build
```

Build specific package:

```bash
pnpm --filter @video-transcoding/api build
```

### Database Migrations

Run migrations (from API app):

```bash
pnpm --filter @video-transcoding/api db:migrate
```

Check database schema:

```bash
pnpm --filter @video-transcoding/api db:check
```

## Apps

### API (`apps/api`)

Main Express server handling video uploads and status queries.

- **Routes**: `/upload` (POST, GET `/status/:id`)
- **Port**: 3000 (configurable via PORT env var)

### Sweeper (`apps/sweeper`)

Background service that polls the outbox table and publishes events to the queue.

- Polls every 2 seconds
- Processes batches of 10 rows
- Uses `FOR UPDATE SKIP LOCKED` for concurrent-safe processing

### Transcoder (`apps/transcoder`)

Video transcoding worker that consumes jobs from the queue and converts videos to HLS format.

- Consumes jobs from BullMQ queue
- Downloads videos from S3
- Transcodes to HLS with multiple resolutions (360p, 480p, 720p, 1080p)
- Uploads HLS files and master playlist to S3
- Updates job progress and status in database

**Requirements:**
- FFmpeg must be installed on the system
- Requires sufficient disk space for temporary files

## Packages

### `@video-transcoding/db`

Shared database package containing:
- Database schema (Drizzle ORM)
- Database connection
- Exported tables: `metaDb`, `outboxDB`

### `@video-transcoding/queue`

Shared queue package containing:
- BullMQ queue configuration
- Video transcoding queue instance
- Worker factory function

### `@video-transcoding/s3`

Shared S3 package containing:
- S3 client configuration (works with MinIO and AWS S3)
- Environment-based configuration

## Adding New Workers

To add a new worker service:

1. Create a new app in `apps/`:
   ```bash
   mkdir -p apps/my-worker/src
   ```

2. Create `package.json`:
   ```json
   {
     "name": "@video-transcoding/my-worker",
     "scripts": {
       "dev": "tsx watch src/index.ts",
       "build": "tsc",
       "start": "node dist/index.js"
     },
     "dependencies": {
       "@video-transcoding/db": "workspace:*",
       "@video-transcoding/queue": "workspace:*"
     }
   }
   ```

3. Use shared packages:
   ```typescript
   import { db, metaDb } from "@video-transcoding/db";
   import videoQueue from "@video-transcoding/queue";
   ```

4. Add scripts to root `package.json` if needed

## Scripts

- `pnpm dev` - Run all apps in development mode
- `pnpm build` - Build all packages
- `pnpm start` - Start all apps in production mode
- `pnpm clean` - Clean all build artifacts

## Docker

Use the provided `docker-compose.yml` to run PostgreSQL, Redis, and MinIO:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

The docker-compose file includes:
- **PostgreSQL** (port 5432) - Database for video metadata
- **Redis** (port 6379) - Queue backend for BullMQ
- **MinIO** (ports 9000, 9001) - S3-compatible object storage

After starting Docker services, run database migrations:

```bash
pnpm --filter @video-transcoding/api db:migrate
```

