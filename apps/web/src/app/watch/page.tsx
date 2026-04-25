"use client";

import Hls from "hls.js";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Video {
  uploadId: string;
  filename: string;
  status: string;
  jobId: string | null;
  uploadedAt: string;
}

function VideoThumbnail({ jobId }: { jobId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    if (!token) return;

    const hlsUrl = `http://localhost:8000/videos/stream/${jobId}/master.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        },
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.currentTime = 2;
      });
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      video.addEventListener("loadedmetadata", () => {
        video.currentTime = 2;
      }, { once: true });
    }
  }, [jobId]);

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="auto"
      onSeeked={() => setReady(true)}
      className={`w-full h-full object-cover transition-opacity duration-500 ${ready ? "opacity-80 grayscale group-hover:grayscale-0" : "opacity-0"}`}
    />
  );
}

const cardRotations = ["rotate-[1deg]", "-rotate-[1deg]", "rotate-[0.5deg]", "-rotate-[0.5deg]", "rotate-[1.5deg]", "-rotate-[1deg]"];

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] text-rf-on-tertiary-fixed bg-rf-tertiary-fixed px-2 py-1 border border-rf-tertiary uppercase inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          COMPLETED
        </span>
      );
    case "processing":
      return (
        <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] text-rf-on-primary bg-rf-primary px-2 py-1 border border-rf-primary uppercase inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 animate-spin">
            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.598a.75.75 0 0 0-.75.75v3.634a.75.75 0 0 0 1.5 0v-2.033l.312.311a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.06-.179Zm-1.624-7.848a7 7 0 0 0-11.712 3.138.75.75 0 0 0 1.06.179 5.5 5.5 0 0 1 9.201-2.466l.312.311H10.116a.75.75 0 1 0 0 1.5h3.634a.75.75 0 0 0 .75-.75V1.854a.75.75 0 0 0-1.5 0v2.033l-.312-.311Z" clipRule="evenodd" />
          </svg>
          PROCESSING
        </span>
      );
    case "failed":
      return (
        <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] text-white bg-red-600 px-2 py-1 border border-red-600 uppercase inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          FAILED
        </span>
      );
    default:
      return (
        <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] text-rf-primary bg-rf-surface-container-high px-2 py-1 border border-rf-primary uppercase inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
          </svg>
          {status.toUpperCase()}
        </span>
      );
  }
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
    <div className="bg-rf-surface text-rf-on-surface font-[family-name:var(--font-inter)] min-h-screen flex flex-col relative">
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <Header activeLink="watch" />

      {/* Main */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-8 py-12 relative z-10">
        <div className="mb-12 border-b border-dashed border-rf-primary pb-6 flex justify-between items-end">
          <div>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl font-bold text-rf-primary tracking-tighter leading-tight mb-2">
              Your Videos
            </h1>
            <p className="text-lg text-rf-secondary">
              Manage and review your processed reels.
            </p>
          </div>
          <Link
            href="/upload"
            className="bg-rf-primary text-rf-on-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase px-6 py-3 border-2 border-rf-primary hover:border-rf-tertiary active:translate-y-0.5 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Project
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-24">
            <div className="mb-6 w-10 h-10 border-2 border-rf-primary border-t-rf-tertiary animate-spin" />
            <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-rf-primary uppercase tracking-wider">
              Loading videos...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-600 p-4">
            <p className="font-[family-name:var(--font-space-grotesk)] text-sm text-red-600 uppercase tracking-wider">
              {error}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && videos.length === 0 && (
          <div className="bg-rf-surface-container-high border border-rf-primary p-16 flex flex-col items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-rf-primary/20 mb-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <p className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-rf-primary uppercase tracking-wider mb-2">
              No videos uploaded yet
            </p>
            <p className="text-rf-secondary mb-8">
              Start your first project by uploading a video file.
            </p>
            <Link
              href="/upload"
              className="bg-rf-primary text-rf-on-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase px-8 py-3 border border-rf-primary hover:border-rf-tertiary hover:border-b-4 active:translate-y-0.5 transition-all"
            >
              Upload your first video
            </Link>
          </div>
        )}

        {/* Video Grid */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, i) => (
              <article
                key={video.uploadId}
                className={`bg-rf-surface-container-high border ${video.status === "failed" ? "border-red-600" : "border-rf-primary"} p-4 ${cardRotations[i % cardRotations.length]} transition-transform hover:rotate-0 hover:z-10 relative flex flex-col group`}
              >
                {/* Diamond accent */}
                <div className={`absolute top-2 right-2 w-2 h-2 ${video.status === "failed" ? "bg-red-600" : "bg-rf-primary"} rotate-45`} />

                {/* Thumbnail area */}
                <div className={`aspect-video ${video.status === "failed" ? "bg-red-50 border-red-600" : "bg-rf-surface-container-highest border-rf-primary"} border ${video.status === "processing" ? "border-dashed" : ""} mb-4 relative overflow-hidden flex items-center justify-center`}>
                  {video.status === "completed" ? (
                    <Link
                      href={`/watch/${video.uploadId}`}
                      className="flex items-center justify-center w-full h-full relative"
                    >
                      {video.jobId && <VideoThumbnail jobId={video.jobId} />}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-white">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-rf-primary transition-colors pointer-events-none" />
                    </Link>
                  ) : video.status === "processing" ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-rf-outline-variant animate-pulse">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                      <div className="absolute bottom-0 left-0 h-1 bg-rf-tertiary w-2/3 animate-pulse" />
                    </>
                  ) : video.status === "failed" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-red-600">
                      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-rf-outline-variant">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    {getStatusBadge(video.status)}
                  </div>
                  <h2
                    className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-rf-primary mb-1 line-clamp-2"
                    title={video.filename}
                  >
                    {video.filename}
                  </h2>
                  <p className={`text-sm ${video.status === "failed" ? "text-red-600" : "text-rf-secondary"}`}>
                    {video.status === "failed"
                      ? "Error: Transcoding failed"
                      : `Uploaded: ${new Date(video.uploadedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`}
                  </p>
                </div>

                {/* Actions */}
                <div className={`mt-4 pt-4 border-t border-dashed ${video.status === "failed" ? "border-red-600" : "border-rf-outline-variant"} flex justify-between ${video.status === "processing" ? "opacity-50 pointer-events-none" : ""}`}>
                  {video.status === "failed" ? (
                    <>
                      <button className="text-red-600 font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase hover:text-rf-primary flex items-center gap-1 active:translate-y-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                        </svg>
                        Retry
                      </button>
                      <button className="text-rf-secondary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase hover:text-rf-primary flex items-center gap-1 active:translate-y-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Discard
                      </button>
                    </>
                  ) : (
                    <>
                      {video.status === "completed" ? (
                        <Link
                          href={`/watch/${video.uploadId}`}
                          className="text-rf-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase hover:text-rf-tertiary flex items-center gap-1 active:translate-y-0.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                          </svg>
                          Watch
                        </Link>
                      ) : (
                        <span className="text-rf-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                          </svg>
                          Edit
                        </span>
                      )}
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
