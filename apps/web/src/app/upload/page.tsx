"use client";

import Link from "next/link";
import { useState, useRef } from "react";

type UploadState = "idle" | "uploading" | "completed" | "failed";

export default function UploadPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function getAccessToken(): Promise<string | null> {
    const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  async function handleUpload() {
    if (!file) return;

    setState("uploading");
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Not authenticated. Please sign in again.");
        setState("failed");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      setState("completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("failed");
    }
  }

  function reset() {
    setState("idle");
    setFile(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

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

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h2 className="mb-8 text-2xl font-semibold text-gray-900">
          Upload a Video
        </h2>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {state === "idle" && (
            <>
              <div
                className="mb-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 transition hover:border-blue-400 hover:bg-blue-50/50"
                onClick={() => fileRef.current?.click()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mb-3 h-10 w-10 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                {file ? (
                  <p className="text-sm font-medium text-gray-700">
                    {file.name}{" "}
                    <span className="text-gray-400">
                      ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Click to select a video file
                  </p>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <button
                onClick={handleUpload}
                disabled={!file}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Upload &amp; Transcode
              </button>
            </>
          )}

          {state === "uploading" && (
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <p className="text-sm font-medium text-gray-700">
                Uploading video...
              </p>
            </div>
          )}

          {state === "completed" && (
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Upload successful!
              </p>
              <p className="mb-4 text-xs text-gray-500">
                Your video is queued for transcoding. Check progress on the videos page.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/watch"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  View Videos
                </Link>
                <button
                  onClick={reset}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Upload Another
                </button>
              </div>
            </div>
          )}

          {state === "failed" && (
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="mb-1 text-sm font-medium text-red-600">
                {error || "Something went wrong"}
              </p>
              <button
                onClick={reset}
                className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
