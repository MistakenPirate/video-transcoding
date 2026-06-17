# Search & Thumbnails

How filename search and video thumbnails work in this system.

## Fuzzy / LIKE search

Search runs on `GET /videos?q=<term>` and matches against `meta_db.filename`
(the only human-readable field). It's powered entirely by PostgreSQL's
[`pg_trgm`](https://www.postgresql.org/docs/current/pgtrgm.html) extension — no
external search service.

### How trigrams work

`pg_trgm` splits a string into overlapping 3-character chunks (trigrams). For
example `"consistent"` becomes `con`, `ons`, `nsi`, `sis`, `ist`, `ste`, `ten`
(plus padded edges). Two strings are compared by how many trigrams they share,
which tolerates typos: a misspelling only alters a few trigrams, so the overlap
stays high.

### The query

`apps/api/src/routes/video.route.ts` builds a `WHERE` that ORs two strategies:

```ts
filename ILIKE '%cons%'  OR  'cons' <% filename
```

- **`ILIKE '%term%'`** — literal substring match. Guarantees clean fragments
  hit: `"cons"` → `"consistent.mp4"`. Wildcard chars (`%`, `_`, `\`) in the
  query are escaped first so they're treated literally.
- **`term <% filename`** — the `word_similarity` operator. Unlike plain
  `similarity()` (which scores the query against the *whole* filename and so
  scores short fragments very low), `word_similarity` scores the query against
  the closest *substring* of the filename. This is what catches typos like
  `"konsis"` → `"consistent"`.

Results are ordered by closeness:

```ts
ORDER BY word_similarity('cons', filename) DESC
```

When `q` is absent, the list falls back to newest-first
(`ORDER BY uploaded_at DESC`). Pagination (`limit`/`offset`/`hasMore`) applies
in both modes.

### Why not the simpler options

- Plain `similarity()` / `%` operator: scores short queries against the whole
  filename, so `"cons"` falls under the 0.3 threshold and matches nothing.
  This was the original implementation and the reason it felt broken.
- `ILIKE` alone: no typo tolerance.
- `levenshtein()`: typo-tolerant but can't use an index, so it's slow at scale.

### Index & setup

A GIN trigram index keeps both `ILIKE` and `<%` fast (no full-table scan):

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX meta_db_filename_trgm ON meta_db USING gin (filename gin_trgm_ops);
```

This lives in `packages/db/sql/001_filename_trgm_search.sql` and must be run
once against the database before search works:

```bash
psql "$DATABASE_URL" -f packages/db/sql/001_filename_trgm_search.sql
```

### Tuning

The fuzzy (`<%`) branch uses `pg_trgm.word_similarity_threshold` (default
`0.6`, fairly strict). The `ILIKE` branch makes this irrelevant for clean
fragments, but to make *typos on short fragments* more forgiving, lower it per
connection: `SET pg_trgm.word_similarity_threshold = 0.4`.

### Client integration

Both clients debounce input by 300ms, put the term in the React Query key, and
reset pagination on each new term. They use `keepPreviousData` so the list
doesn't blank out between keystrokes.

- Web: `apps/web/src/app/watch/page.tsx`
- Mobile: `apps/mobile/src/hooks/use-videos.ts` + `apps/mobile/src/app/(app)/index.tsx`

## Thumbnails

A real thumbnail image **is** generated server-side during transcoding, but the
two clients consume it differently.

### Generation (transcoder)

`apps/transcoder/src/index.ts` uses ffmpeg to extract a single frame at the
2-second mark and write a 640×360 JPEG:

```ts
ffmpeg(inputPath)
  .screenshots({
    timestamps: [2],
    filename: "thumbnail.jpg",
    folder: outputDir,
    size: "640x360",
  })
```

It's uploaded alongside the HLS output to object storage (MinIO/S3) at:

```
videos/{jobId}/thumbnail.jpg
videos/{jobId}/master.m3u8
videos/{jobId}/{resolution}/index.m3u8   # 360p, 480p
videos/{jobId}/{resolution}/seg_000.ts   # 10s segments
```

All of this is served back through the API's streaming proxy,
`GET /videos/stream/:jobId/*path`, which pipes the object out of storage with
the right content type.

### Mobile — uses the generated thumbnail

`apps/mobile/src/components/video-card.tsx` loads the JPEG directly:

```tsx
<Image source={{ uri: `${API_URL}/videos/stream/${video.jobId}/thumbnail.jpg?token=${token}` }} />
```

(The token is passed as a query param because React Native's `<Image>` can't
set an `Authorization` header.) Falls back to a placeholder on error.

### Web — uses the generated thumbnail

`apps/web/src/app/watch/page.tsx`'s `VideoThumbnail` component loads the same
`thumbnail.jpg` as mobile, via a plain `<img>`:

```tsx
const src = `${API_URL}/videos/stream/${jobId}/thumbnail.jpg?token=${token}`;
```

The token is passed in the query string because `<img>` can't set an
`Authorization` header (the stream route's auth middleware accepts `?token=`).
On load error it renders nothing (the card's status icon shows through).

> Previously this component downloaded the full HLS stream with hls.js and
> seeked a `<video>` to `currentTime = 2` just to render a static preview
> frame. Switching to the ready-made 640×360 JPEG cuts the per-card cost from
> "fetch manifests + segments" to a single image request.
