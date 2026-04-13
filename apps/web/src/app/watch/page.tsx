"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Video {
  uploadId: string;
  filename: string;
  status: string;
  jobId: string | null;
  uploadedAt: string;
}

export default function WatchPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
        const token = match ? decodeURIComponent(match[1]) : null;
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:8000/videos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch videos");

        const data = await res.json();
        setVideos(data.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="text-xl font-bold text-gray-900 hover:text-gray-700"
          >
            Video Transcoder
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-8 text-2xl font-semibold text-gray-900">
          Your Videos
        </h2>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white py-16">
            <p className="mb-4 text-gray-500">No videos uploaded yet.</p>
            <Link
              href="/upload"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Upload your first video
            </Link>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video.uploadId}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex h-36 items-center justify-center bg-gray-900">
                  {video.status === "completed" ? (
                    <Link
                      href={`/watch/${video.uploadId}`}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="ml-1 h-8 w-8"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">
                      {video.status === "uploaded" || video.status === "queued"
                        ? "Queued..."
                        : video.status === "processing"
                          ? "Transcoding..."
                          : video.status}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p
                    className="mb-1 truncate text-sm font-medium text-gray-900"
                    title={video.filename}
                  >
                    {video.filename}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {new Date(video.uploadedAt).toLocaleDateString()}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        video.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : video.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {video.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
