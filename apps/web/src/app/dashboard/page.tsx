import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth, signOut } from "../auth/actions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function Dashboard() {
  const user = await requireAuth();
  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="bg-rf-surface text-rf-on-surface font-[family-name:var(--font-inter)] min-h-screen flex flex-col relative">
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <Header signOutAction={signOut} userEmail={user.email} />

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 w-full max-w-[1440px] mx-auto relative z-10">
        <div className="w-full max-w-4xl flex flex-col gap-12 items-center">
          <header className="text-center">
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl font-bold text-rf-primary tracking-tighter leading-tight mb-4 border-b-2 border-dashed border-rf-primary inline-block pb-2 px-8">
              What would you like to do?
            </h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Upload Card */}
            <Link
              href="/upload"
              className="group relative block bg-rf-surface-container-high border-2 border-dashed border-rf-primary p-8 hover:bg-rf-surface-container transition-colors active:translate-y-0.5"
            >
              <div className="absolute top-2 right-2 w-2 h-2 bg-rf-primary rotate-45" />
              <div className="flex flex-col h-full justify-between gap-6">
                <div className="flex items-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-rf-primary">
                    <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.69a.75.75 0 0 0 1.5 0v-4.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
                  </svg>
                  <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-rf-primary uppercase">
                    Upload a Video
                  </h2>
                </div>
                <p className="text-rf-secondary border-t border-rf-primary pt-4">
                  Transcode video files into multiple HLS resolutions.
                </p>
                <div className="mt-auto pt-4 flex justify-end">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rf-primary group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Watch Card */}
            <Link
              href="/watch"
              className="group relative block bg-rf-surface-container-high border-2 border-dashed border-rf-primary p-8 hover:bg-rf-surface-container transition-colors active:translate-y-0.5"
            >
              <div className="absolute top-2 right-2 w-2 h-2 bg-rf-primary rotate-45" />
              <div className="flex flex-col h-full justify-between gap-6">
                <div className="flex items-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-rf-primary">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z" clipRule="evenodd" />
                  </svg>
                  <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-rf-primary uppercase">
                    Watch Videos
                  </h2>
                </div>
                <p className="text-rf-secondary border-t border-rf-primary pt-4">
                  Browse and watch your uploaded videos with adaptive streaming.
                </p>
                <div className="mt-auto pt-4 flex justify-end">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rf-primary group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
