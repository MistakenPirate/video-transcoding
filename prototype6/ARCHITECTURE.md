# Prototype6 Architecture

```mermaid
graph LR
    User[User] -->|Upload Video| API[API Server]
    User -->|GET /status/:id| API
    
    API -->|Store Original| S3[(MinIO<br/>S3 Storage)]
    API -->|Write meta_db + outbox| DB[(PostgreSQL)]
    
    Sweeper[Sweeper] -->|Poll outbox<br/>every 2s| DB
    Sweeper -->|Publish Jobs| Queue[(Redis<br/>BullMQ)]
    
    Queue -->|Consume| Transcoder[Transcoder Worker]
    Transcoder -->|Download Original| S3
    Transcoder -->|Upload HLS| S3
    Transcoder -->|Update meta_db| DB
    
    API -->|Query Job Status| Queue
    
    style API fill:#4A90E2,color:#fff
    style Sweeper fill:#F5A623,color:#fff
    style Transcoder fill:#7ED321,color:#fff
    style DB fill:#9013FE,color:#fff
    style Queue fill:#BD10E0,color:#fff
    style S3 fill:#50E3C2,color:#000
```

## Data Flow

### Upload Flow
1. **User** uploads video file → **API**
2. **API** computes file hash and checks for duplicates
3. **API** uploads original video to **S3** (`uploads/{hash}/original.mp4`)
4. **API** writes metadata to `meta_db` table (status: "uploaded")
5. **API** writes event to `outbox` table (status: "pending")

### Outbox Processing Flow
1. **Sweeper** polls `outbox` table every 2 seconds
2. **Sweeper** locks and fetches up to 10 pending rows (`FOR UPDATE SKIP LOCKED`)
3. **Sweeper** updates `outbox` status to "processing"
4. **Sweeper** updates `meta_db` status to "queued"
5. **Sweeper** publishes jobs to **Redis** queue
6. **Sweeper** updates `outbox` status to "sent" with job ID

### Transcoding Flow
1. **Transcoder** consumes job from **Redis** queue
2. **Transcoder** updates `meta_db` status to "processing"
3. **Transcoder** downloads original video from **S3**
4. **Transcoder** transcodes to HLS format (360p, 480p, 720p, 1080p)
5. **Transcoder** uploads HLS segments and playlists to **S3** (`videos/{jobId}/`)
6. **Transcoder** creates and uploads master playlist (`master.m3u8`)
7. **Transcoder** updates `meta_db` status to "completed"
8. **Transcoder** cleans up temporary files

### Status Query Flow
1. **User** requests status → **API**
2. **API** queries **Redis** for job state and progress
3. **API** returns job status, progress, and HLS playlist URLs

## Tech Stack

### Runtime & Language
- **Node.js** >= 18.0.0
- **TypeScript** 5.9.3
- **pnpm** 9.0.0 (package manager)

### Monorepo & Build Tools
- **Turborepo** 2.0.0 - Monorepo build system
- **tsx** 4.7.0 - TypeScript execution for development
- **TypeScript Compiler** - Production builds

### Backend Framework
- **Express.js** 5.1.0 - Web framework for API server
- **Multer** 2.0.2 - File upload middleware

### Database & ORM
- **PostgreSQL** 16-alpine - Relational database
- **Drizzle ORM** 0.44.7 - TypeScript ORM
- **Drizzle Kit** 0.31.7 - Database migrations and schema generation
- **pg** 8.16.3 - PostgreSQL client

### Queue System
- **BullMQ** 5.63.0 - Redis-based job queue
- **Redis** 7 - Queue backend

### Storage
- **AWS SDK v3** 3.927.0 - S3 client library
- **MinIO** - S3-compatible object storage

### Video Processing
- **FFmpeg** (system dependency) - Video transcoding engine
- **fluent-ffmpeg** 2.1.2 - Node.js wrapper for FFmpeg

### Infrastructure & DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **dotenv** 17.2.3 - Environment variable management

### Utilities
- **uuid** 13.0.0 - UUID generation
- **crypto** (Node.js built-in) - File hashing for duplicate detection

### Development Dependencies
- **@types/express** 5.0.5
- **@types/multer** 2.0.0
- **@types/node** 24.10.0
- **@types/pg** 8.15.6
- **@types/uuid** 10.0.0
- **@types/fluent-ffmpeg** 2.1.24

## Key Features

- **Outbox Pattern**: Ensures reliable event publishing using database transactions
- **Duplicate Detection**: File hash-based deduplication prevents re-processing
- **Multi-Resolution HLS**: Transcodes to 4 resolutions (360p, 480p, 720p, 1080p)
- **Concurrent Processing**: Sweeper uses `FOR UPDATE SKIP LOCKED` for safe concurrent access
- **Progress Tracking**: Real-time job progress updates via BullMQ
- **Monorepo Structure**: Shared packages for database, queue, and S3 client

