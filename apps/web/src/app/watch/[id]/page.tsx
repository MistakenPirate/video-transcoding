"use client";

import { useQuery } from "@tanstack/react-query";
import Hls from "hls.js";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import { apiFetch, getAccessToken } from "@/lib/api";

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
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [levels, setLevels] = useState<{ height: number; width: number }[]>([]);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const res = await apiFetch<{ videos: VideoInfo[] }>("/videos");
      const found = res.videos.find((v) => v.uploadId === id);
      if (!found) throw new Error("Video not found");
      return found;
    },
  });

  const video = data ?? null;
  const loading = isLoading;
  const error =
    queryError?.message ??
    playerError ??
    (video && video.status !== "completed"
      ? video.status === "failed"
        ? "Transcoding failed for this video"
        : "Video is still being transcoded"
      : null);

  useEffect(() => {
    if (!video || video.status !== "completed" || !video.jobId) return;
    if (!videoRef.current) return;

    const token = getAccessToken();
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const hlsUrl = `${API_URL}/videos/stream/${video.jobId}/master.m3u8`;

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
          data.levels.map((l) => ({ height: l.height, width: l.width })),
        );
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setPlayerError("Playback error. The video may not be available yet.");
        }
      });

      hlsRef.current = hls;
    } else if (
      videoRef.current.canPlayType("application/vnd.apple.mpegurl")
    ) {
      videoRef.current.src = hlsUrl;
    } else {
      setPlayerError("HLS playback is not supported in this browser");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [video]);

  function switchQuality(levelIndex: number) {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
  }

  return (
    <div className="bg-rf-surface text-rf-on-surface font-[family-name:var(--font-inter)] min-h-screen flex flex-col relative">
      {/* Background Blueprint Grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-grow max-w-[1440px] mx-auto px-8 w-full">
        {/* Header */}
        <header className="flex justify-between items-center py-6 border-b-2 border-rf-primary border-dashed">
          <Link
            href="/watch"
            className="flex items-center gap-2 text-rf-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase hover:underline decoration-rf-tertiary decoration-2 underline-offset-4 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Videos
          </Link>
          {video && (
            <div className="text-right">
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-rf-primary" title={video.filename}>
                {video.filename}
              </h1>
              <p className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] text-rf-secondary mt-1">
                ID: {video.uploadId.slice(0, 12).toUpperCase()}
              </p>
            </div>
          )}
        </header>

        {/* Main */}
        <main className="flex-grow flex flex-col items-center justify-center py-6">
          {loading && (
            <div className="flex flex-col items-center py-24">
              <div className="mb-6 w-10 h-10 border-2 border-rf-primary border-t-rf-tertiary animate-spin" />
              <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-rf-primary uppercase tracking-wider">
                Loading video...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center py-24">
              <p className="font-[family-name:var(--font-space-grotesk)] text-sm text-red-600 uppercase tracking-wider mb-4">
                {error}
              </p>
              <Link
                href="/watch"
                className="bg-rf-surface border-double border-4 border-rf-primary text-rf-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase px-8 py-3 active:translate-y-0.5 transition-transform hover:bg-rf-surface-container"
              >
                Back to Videos
              </Link>
            </div>
          )}

          {!error && (
            <>
              {/* Video Player Container */}
              <div className="w-full max-w-5xl bg-rf-surface-container-high border-2 border-rf-primary relative p-1 shadow-[4px_4px_0_0_theme(--color-rf-primary)]">
                {/* Corner Diamonds */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-rf-primary rotate-45" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-rf-primary rotate-45" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-rf-primary rotate-45" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-rf-primary rotate-45" />

                <div className="relative w-full bg-black border border-rf-primary border-dashed overflow-hidden">
                  <video
                    ref={videoRef}
                    controls
                    className="aspect-video w-full"
                    playsInline
                  />
                </div>
              </div>

              {/* Quality Selector + Metadata */}
              {levels.length > 0 && (
                <div className="w-full max-w-5xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Video Info */}
                  <div className="col-span-2 bg-rf-surface-container-high p-6 border border-rf-primary border-dashed relative">
                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-rf-primary">
                      {video?.filename}
                    </h2>
                  </div>

                  {/* Technical Specs */}
                  <div className="col-span-1 bg-rf-surface-container-high p-6 border-2 border-rf-primary relative flex flex-col gap-4">
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-rf-primary rotate-45" />
                    <h3 className="font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] text-rf-primary border-b border-rf-primary pb-2 uppercase">
                      Quality
                    </h3>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => switchQuality(-1)}
                        className={`w-full px-3 py-2 font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] border transition-colors ${
                          currentLevel === -1
                            ? "border-rf-tertiary text-rf-on-tertiary-fixed bg-rf-tertiary-fixed"
                            : "border-rf-primary text-rf-primary bg-rf-surface hover:bg-rf-surface-container"
                        }`}
                      >
                        AUTO
                      </button>
                      {levels.map((level, i) => (
                        <button
                          key={i}
                          onClick={() => switchQuality(i)}
                          className={`w-full px-3 py-2 font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] border transition-colors ${
                            currentLevel === i
                              ? "border-rf-tertiary text-rf-on-tertiary-fixed bg-rf-tertiary-fixed"
                              : "border-rf-primary text-rf-primary bg-rf-surface hover:bg-rf-surface-container"
                          }`}
                        >
                          {level.height}P
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

      </div>

      <Footer />
    </div>
  );
}
