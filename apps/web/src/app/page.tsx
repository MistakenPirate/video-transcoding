import Link from "next/link";
import Footer from "@/components/Footer";
import { getCurrentUser, signOut } from "./auth/actions";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="bg-rf-surface text-rf-on-surface font-[family-name:var(--font-inter)] selection:bg-rf-tertiary-fixed selection:text-rf-on-tertiary-fixed">
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Header */}
      <header className="bg-rf-surface border-b-2 border-rf-primary/20 sticky top-0 z-50">
        <div className="flex justify-between items-center px-8 h-20 w-full max-w-[1440px] mx-auto">
          <Link
            href="/"
            className="text-2xl font-[family-name:var(--font-space-grotesk)] font-bold tracking-widest text-rf-primary uppercase"
          >
            ReelFlow
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-rf-primary text-rf-on-primary px-6 py-2.5 font-[family-name:var(--font-space-grotesk)] font-bold text-sm uppercase tracking-tighter hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="font-[family-name:var(--font-space-grotesk)] uppercase tracking-tighter text-sm font-bold text-rf-secondary hover:text-rf-primary transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="font-[family-name:var(--font-space-grotesk)] uppercase tracking-tighter text-sm font-bold text-rf-secondary hover:text-rf-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-rf-primary text-rf-on-primary px-6 py-2.5 font-[family-name:var(--font-space-grotesk)] font-bold text-sm uppercase tracking-tighter hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto px-8 pt-24 pb-32 grid grid-cols-12 gap-12 items-center">
          <div className="col-span-12 md:col-span-6 space-y-8">
            <div className="inline-block px-4 py-1 bg-rf-tertiary-fixed text-rf-on-tertiary-fixed font-[family-name:var(--font-space-grotesk)] text-sm uppercase tracking-widest -rotate-2">
              Beta Access: Vellum 1.0
            </div>
            <h1 className="text-5xl lg:text-7xl font-[family-name:var(--font-space-grotesk)] font-bold text-rf-primary leading-tight tracking-tighter">
              ReelFlow: Video Transcoding,{" "}
              <span className="italic text-rf-tertiary underline decoration-double decoration-rf-tertiary/30">
                Drafted by Hand.
              </span>
            </h1>
            <p className="text-xl text-rf-secondary max-w-lg leading-relaxed">
              A technical workspace for engineers who treat infrastructure as
              art. Reliable, deterministic video pipelines built on a foundation
              of architectural integrity.
            </p>
            <div className="flex gap-6 pt-4 flex-wrap">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-rf-primary text-rf-on-primary px-8 py-4 font-[family-name:var(--font-space-grotesk)] font-bold text-lg hover:underline decoration-rf-tertiary decoration-4 underline-offset-8 transition-all active:translate-y-0.5"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/upload"
                    className="border-2 border-rf-primary text-rf-primary px-8 py-4 font-[family-name:var(--font-space-grotesk)] font-bold text-lg hover:bg-rf-surface-container-low transition-all"
                  >
                    Upload a Video
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="bg-rf-primary text-rf-on-primary px-8 py-4 font-[family-name:var(--font-space-grotesk)] font-bold text-lg hover:underline decoration-rf-tertiary decoration-4 underline-offset-8 transition-all active:translate-y-0.5"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/signin"
                    className="border-2 border-rf-primary text-rf-primary px-8 py-4 font-[family-name:var(--font-space-grotesk)] font-bold text-lg hover:bg-rf-surface-container-low transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 relative">
            <div className="aspect-square bg-rf-surface-container-low border border-rf-outline-variant/30 p-8 flex flex-col justify-center items-center relative overflow-hidden">
              {/* SVG decoration */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg
                  fill="none"
                  viewBox="0 0 400 400"
                  width="100%"
                  height="100%"
                >
                  <path
                    d="M50 200 C 100 50, 300 50, 350 200"
                    stroke="#103956"
                    strokeDasharray="8 4"
                    strokeWidth="1"
                  />
                  <path
                    d="M50 200 C 100 350, 300 350, 350 200"
                    stroke="#103956"
                    strokeDasharray="8 4"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <div className="z-10 bg-rf-surface-container-lowest p-6 border-2 border-rf-primary shadow-xl rotate-1 relative w-full max-w-sm">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-2 bg-rf-primary/20" />
                  <div className="w-24 h-2 bg-rf-primary/10" />
                </div>
                <div className="w-full aspect-video bg-rf-surface-container-high mb-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-16 h-16 text-rf-primary/20"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-[family-name:var(--font-space-grotesk)] text-xs text-rf-secondary">
                    SOURCE: 4K_LOG_001.MOV
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-rf-tertiary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"
                    />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-12 right-12 bg-rf-tertiary-fixed p-4 shadow-lg -rotate-3 border border-rf-tertiary/20 max-w-[160px]">
                <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-rf-on-tertiary-fixed leading-tight">
                  Note: Bitrate optimized for high-motion grain preservation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reliability Section */}
        <section className="bg-rf-surface-container-low py-32 border-y border-rf-outline-variant/10">
          <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-16">
            <div className="col-span-12 md:col-span-5 space-y-6">
              <h2 className="text-4xl font-[family-name:var(--font-space-grotesk)] font-bold text-rf-primary tracking-tight">
                Reliability by Design.
              </h2>
              <p className="text-rf-secondary leading-relaxed">
                We leverage the{" "}
                <span className="text-rf-on-surface font-semibold">
                  Transactional Outbox Pattern
                </span>{" "}
                to ensure that no job is ever lost between our API and the
                processing worker. Every state change is drafted first, then
                executed.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex gap-4 items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-rf-tertiary-container shrink-0 mt-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-rf-primary block">
                      Atomic Commit
                    </span>
                    <span className="text-sm text-rf-secondary">
                      Database and message queue in perfect sync.
                    </span>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-rf-tertiary-container shrink-0 mt-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-rf-primary block">
                      Zero-Loss Workers
                    </span>
                    <span className="text-sm text-rf-secondary">
                      Job processing that resumes precisely where it left off.
                    </span>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-rf-tertiary-container shrink-0 mt-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-rf-primary block">
                      Microservices Architecture
                    </span>
                    <span className="text-sm text-rf-secondary">
                      Modular scalability for independent service deployment.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="col-span-12 md:col-span-7 bg-rf-surface-container-lowest p-12 border-4 border-double border-rf-primary/20 relative">
              <div className="absolute top-4 left-4 font-[family-name:var(--font-space-grotesk)] text-[10px] text-rf-secondary tracking-widest uppercase">
                Draft No. 42 / Outbox Schema
              </div>
              <div className="grid grid-cols-3 gap-8 items-center h-full relative">
                <div className="border border-rf-primary/40 p-6 flex flex-col items-center gap-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-10 h-10 text-rf-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                    />
                  </svg>
                  <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold">
                    PRIMARY DB
                  </span>
                  <div className="w-full h-8 bg-rf-tertiary-fixed/30 border border-dashed border-rf-tertiary flex items-center justify-center">
                    <span className="text-[10px] uppercase font-bold text-rf-tertiary">
                      Outbox Table
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-rf-tertiary-container animate-pulse"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                  <span className="font-[family-name:var(--font-space-grotesk)] text-[10px] text-rf-secondary mt-2">
                    RELAY SERVICE
                  </span>
                </div>
                <div className="border border-rf-primary/40 p-6 flex flex-col items-center gap-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-10 h-10 text-rf-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                    />
                  </svg>
                  <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold">
                    MESSAGE BUS
                  </span>
                  <div className="w-full h-8 bg-rf-primary/5 border border-rf-primary/20" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Player Preview Section */}
        <section className="max-w-[1440px] mx-auto px-8 py-32">
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <h3 className="text-3xl font-[family-name:var(--font-space-grotesk)] font-bold text-rf-primary">
              Technical Preview
            </h3>
            <p className="text-rf-secondary">
              Pencil-thin controls for high-precision review.
            </p>
          </div>
          <div className="max-w-4xl mx-auto border-2 border-rf-primary/10 p-2 bg-rf-surface-container-high relative">
            <div className="absolute -top-4 -right-4 bg-rf-primary text-rf-on-primary px-3 py-1 font-[family-name:var(--font-space-grotesk)] text-[10px] uppercase z-10">
              Review Mode
            </div>
            <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rf-primary/30 to-black" />
              <div className="z-10 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-20 h-20 text-white/50 hover:text-white cursor-pointer transition-colors"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="p-6 bg-rf-surface-container-lowest flex flex-col gap-6">
              <div className="w-full h-1 bg-rf-surface-container-highest relative">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-rf-tertiary-container" />
                <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-4 h-4 border-2 border-rf-primary bg-rf-surface rotate-45" />
              </div>
              <div className="flex justify-between items-center px-2">
                <div className="flex gap-8">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rf-secondary cursor-pointer hover:text-rf-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.062a1.125 1.125 0 0 1 0-1.953l7.108-4.062A1.125 1.125 0 0 1 21 8.688v8.123ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.062a1.125 1.125 0 0 1 0-1.953l7.108-4.062a1.125 1.125 0 0 1 1.683.977v8.123Z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rf-secondary cursor-pointer hover:text-rf-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rf-secondary cursor-pointer hover:text-rf-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062A1.125 1.125 0 0 1 3 16.811V8.689ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062a1.125 1.125 0 0 1-1.683-.977V8.689Z" />
                  </svg>
                </div>
                <div className="font-[family-name:var(--font-space-grotesk)] text-sm text-rf-primary font-bold">
                  01:42 / 04:55
                </div>
                <div className="flex gap-6 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rf-secondary cursor-pointer hover:text-rf-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rf-secondary cursor-pointer hover:text-rf-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="max-w-[1440px] mx-auto px-8 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[280px]">
            <div className="md:col-span-2 md:row-span-2 bg-rf-primary p-10 flex flex-col justify-end text-rf-on-primary group cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 mb-6 text-rf-tertiary-fixed"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z"
                />
              </svg>
              <h4 className="text-4xl font-[family-name:var(--font-space-grotesk)] font-bold mb-4">
                Architecture First.
              </h4>
              <p className="text-rf-on-primary-container leading-relaxed max-w-sm">
                Our codebase is as clean as a fresh sheet of vellum. We
                prioritize maintainability and clarity over quick hacks.
              </p>
              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 font-[family-name:var(--font-space-grotesk)] uppercase text-xs tracking-widest text-rf-tertiary-fixed">
                Explore our engineering blog
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
            <div className="bg-rf-surface-container-high p-6 flex flex-col justify-between border-b-4 border-rf-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-rf-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              <div className="space-y-1">
                <h5 className="font-[family-name:var(--font-space-grotesk)] font-bold text-rf-primary text-sm">
                  Parallel Jobs
                </h5>
                <p className="text-[10px] leading-tight text-rf-secondary">
                  Distributed rendering across global clusters.
                </p>
              </div>
            </div>
            <div className="bg-rf-surface-container-high p-6 flex flex-col justify-between border-b-4 border-rf-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-rf-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
              </svg>
              <div className="space-y-1">
                <h5 className="font-[family-name:var(--font-space-grotesk)] font-bold text-rf-primary text-sm">
                  Dockerized Environment
                </h5>
                <p className="text-[10px] leading-tight text-rf-secondary">
                  Consistent deployments across every node.
                </p>
              </div>
            </div>
            <div className="md:col-span-2 bg-rf-surface-container p-8 flex items-center gap-10">
              <div className="flex-1 space-y-4">
                <h5 className="text-2xl font-[family-name:var(--font-space-grotesk)] font-bold text-rf-primary">
                  Seamless Streaming
                </h5>
                <p className="text-rf-secondary">
                  Manage master deliverables and archival footage in one unified
                  dashboard.
                </p>
              </div>
              <div className="w-32 h-32 bg-rf-surface-container-lowest border border-dashed border-rf-primary/30 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-rf-primary/20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
