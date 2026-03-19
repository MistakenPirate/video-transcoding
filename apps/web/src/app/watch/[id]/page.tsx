"use client";

import Link from "next/link";
import { useEffect, useRef, useState, use } from "react";
import Hls from "hls.js";

interface VideoInfo {
  uploadId: string;
  filename: string;
  status: string;
  jobId: string | null;
}

export default function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [levels, setLevels] = useState<{ height: number; width: number }[]>([]);

  useEffect(() => {
    async function loadVideo() {
      try {
        const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
        const token = match ? decodeURIComponent(match[1]) : null;
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        // Fetch video info
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/videos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch video info");

        const data = await res.json();
        const found = data.videos.find(
          (v: VideoInfo) => v.uploadId === id
        );

        if (!found) {
          setError("Video not found");
          setLoading(false);
          return;
        }

        setVideo(found);

        if (found.status !== "completed" || !found.jobId) {
          setError(
            found.status === "failed"
              ? "Transcoding failed for this video"
              : "Video is still being transcoded"
          );
          setLoading(false);
          return;
        }

        // Build HLS URL through API proxy
        const hlsUrl = `${process.env.NEXT_PUBLIC_API_URL}/videos/stream/${found.jobId}/master.m3u8`;

        if (!videoRef.current) return;

        if (Hls.isSupported()) {
          const hls = new Hls({
            xhrSetup: (xhr) => {
              xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            },
          });

          hls.loadSource(hlsUrl);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
            setLevels(
              data.levels.map((l) => ({ height: l.height, width: l.width }))
            );
            setLoading(false);
          });

          hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
            setCurrentLevel(data.level);
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              setError("Playback error. The video may not be available yet.");
              setLoading(false);
            }
          });

          hlsRef.current = hls;
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari native HLS
          videoRef.current.src = hlsUrl;
          setLoading(false);
        } else {
          setError("HLS playback is not supported in this browser");
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
        setLoading(false);
      }
    }

    loadVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [id]);

  function switchQuality(levelIndex: number) {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/watch"
            className="text-sm font-medium text-gray-400 hover:text-white"
          >
            &larr; Back to Videos
          </Link>
          {video && (
            <h1
              className="max-w-md truncate text-sm font-medium text-white"
              title={video.filename}
            >
              {video.filename}
            </h1>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {loading && (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-blue-600" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-24">
            <p className="mb-4 text-sm text-red-400">{error}</p>
            <Link
              href="/watch"
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800"
            >
              Back to Videos
            </Link>
          </div>
        )}

        {!error && (
          <>
            <div className="overflow-hidden rounded-xl bg-black">
              <video
                ref={videoRef}
                controls
                className="aspect-video w-full"
                playsInline
              />
            </div>

            {levels.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-gray-500">Quality:</span>
                <button
                  onClick={() => switchQuality(-1)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    currentLevel === -1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Auto
                </button>
                {levels.map((level, i) => (
                  <button
                    key={i}
                    onClick={() => switchQuality(i)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                      currentLevel === i
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {level.height}p
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
