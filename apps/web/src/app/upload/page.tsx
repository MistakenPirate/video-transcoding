"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAccessToken } from "@/lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated. Please sign in again.");

      const formData = new FormData();
      formData.append("file", file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      return res.json();
    },
  });

  const state = uploadMutation.isPending
    ? "uploading"
    : uploadMutation.isSuccess
      ? "completed"
      : uploadMutation.isError
        ? "failed"
        : "idle";
  const error = uploadMutation.error?.message ?? null;

  function handleUpload() {
    if (!file) return;
    uploadMutation.mutate(file);
  }

  function reset() {
    uploadMutation.reset();
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
    }
  }

  return (
    <div className="bg-rf-surface text-rf-on-surface font-[family-name:var(--font-inter)] min-h-screen flex flex-col relative">
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <Header activeLink="upload" />

      {/* Main */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-8 py-12 flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-3xl bg-rf-surface-container-high border border-rf-primary rotate-[1deg] hover:rotate-0 transition-transform duration-300 p-8 relative">
          {/* Corner Accents */}
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-rf-tertiary border border-rf-primary rotate-45" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-rf-tertiary border border-rf-primary rotate-45" />

          <div className="mb-8 border-b-2 border-dashed border-rf-primary pb-4">
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl font-bold text-rf-primary uppercase tracking-tighter leading-tight">
              Upload a Video
            </h1>
            <p className="text-rf-secondary mt-2">
              Select a raw file for processing and transcoding onto the global
              timeline.
            </p>
          </div>

          {state === "idle" && (
            <>
              {/* Dropzone */}
              <div
                className={`w-full h-80 border-2 border-dashed border-rf-primary flex flex-col items-center justify-center cursor-pointer mb-8 relative group overflow-hidden transition-all ${
                  isDragging
                    ? "bg-rf-surface-container border-solid"
                    : "bg-rf-surface hover:bg-rf-surface-container hover:border-solid"
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="relative z-10 flex flex-col items-center text-center p-6 bg-rf-surface border border-rf-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-12 h-12 text-rf-primary mb-4"
                  >
                    <path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  {file ? (
                    <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-rf-primary uppercase block mb-2">
                      {file.name}{" "}
                      <span className="text-rf-secondary text-base">
                        ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </span>
                  ) : (
                    <>
                      <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-rf-primary uppercase block mb-2">
                        Click to select a video file
                      </span>
                      <span className="text-rf-secondary block">
                        or drag and drop onto the drafting board
                      </span>
                    </>
                  )}
                  <div className="mt-4 flex gap-2">
                    <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] bg-rf-surface-container-high border border-rf-primary px-2 py-1 text-rf-primary">
                      .MP4
                    </span>
                    <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] bg-rf-surface-container-high border border-rf-primary px-2 py-1 text-rf-primary">
                      .MOV
                    </span>
                    <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] bg-rf-surface-container-high border border-rf-primary px-2 py-1 text-rf-primary">
                      .RAW
                    </span>
                  </div>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              {/* Actions */}
              <div className="flex justify-end gap-4 border-t border-rf-primary pt-6">
                <Link
                  href="/dashboard"
                  className="bg-rf-surface border-double border-4 border-rf-primary text-rf-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase px-8 py-3 active:translate-y-0.5 transition-transform hover:bg-rf-surface-container"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleUpload}
                  disabled={!file}
                  className="bg-rf-primary text-rf-on-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase px-8 py-3 active:translate-y-0.5 transition-all hover:border-b-4 hover:border-rf-tertiary border border-rf-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload &amp; Transcode
                </button>
              </div>
            </>
          )}

          {state === "uploading" && (
            <div className="flex flex-col items-center py-16">
              <div className="mb-6 w-10 h-10 border-2 border-rf-primary border-t-rf-tertiary animate-spin" />
              <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-rf-primary uppercase tracking-wider">
                Uploading video...
              </p>
              <p className="text-rf-secondary text-sm mt-2">
                Transferring to processing pipeline
              </p>
            </div>
          )}

          {state === "completed" && (
            <div className="flex flex-col items-center py-16">
              <div className="mb-6 w-14 h-14 bg-rf-tertiary-fixed border-2 border-rf-primary flex items-center justify-center rotate-45">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-7 h-7 text-rf-primary -rotate-45"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>
              <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-rf-primary uppercase tracking-wider mb-2">
                Upload successful
              </p>
              <p className="text-rf-secondary text-sm mb-8">
                Your video is queued for transcoding. Check progress on the
                videos page.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/watch"
                  className="bg-rf-primary text-rf-on-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase px-8 py-3 active:translate-y-0.5 transition-all hover:border-b-4 hover:border-rf-tertiary border border-rf-primary"
                >
                  View Videos
                </Link>
                <button
                  onClick={reset}
                  className="bg-rf-surface border-double border-4 border-rf-primary text-rf-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase px-8 py-3 active:translate-y-0.5 transition-transform hover:bg-rf-surface-container"
                >
                  Upload Another
                </button>
              </div>
            </div>
          )}

          {state === "failed" && (
            <div className="flex flex-col items-center py-16">
              <div className="mb-6 w-14 h-14 bg-red-100 border-2 border-red-600 flex items-center justify-center rotate-45">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-7 h-7 text-red-600 -rotate-45"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-red-600 uppercase tracking-wider mb-2">
                {error || "Something went wrong"}
              </p>
              <button
                onClick={reset}
                className="mt-4 bg-rf-surface border-double border-4 border-rf-primary text-rf-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase px-8 py-3 active:translate-y-0.5 transition-transform hover:bg-rf-surface-container"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
