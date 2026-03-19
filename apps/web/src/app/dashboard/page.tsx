import Link from "next/link";
import { requireAuth, signOut } from "../auth/actions";

export default async function Dashboard() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Video Transcoder</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-8 text-2xl font-semibold text-gray-900">
          What would you like to do?
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/upload"
            className="group rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Upload a Video
            </h3>
            <p className="text-sm text-gray-500">
              Upload a video file to transcode it into multiple HLS resolutions
              (360p, 480p, 720p, 1080p).
            </p>
          </Link>

          <Link
            href="/watch"
            className="group rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Watch Videos
            </h3>
            <p className="text-sm text-gray-500">
              Browse and watch your uploaded videos with adaptive HLS streaming.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
