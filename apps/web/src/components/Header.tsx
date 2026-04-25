import Link from "next/link";

interface HeaderProps {
  activeLink?: "upload" | "watch";
  signOutAction?: () => Promise<void>;
  userEmail?: string;
}

export default function Header({ activeLink, signOutAction, userEmail }: HeaderProps) {
  return (
    <header className="bg-rf-surface border-b-2 border-rf-primary/20 sticky top-0 z-50">
      <div className="flex justify-between items-center px-8 h-20 w-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-2xl font-[family-name:var(--font-space-grotesk)] font-bold tracking-widest text-rf-primary uppercase"
          >
            ReelFlow
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/upload"
              className={`font-[family-name:var(--font-space-grotesk)] uppercase tracking-tighter text-sm font-bold px-2 py-1 transition-colors ${
                activeLink === "upload"
                  ? "text-rf-primary border-b-4 border-rf-tertiary pb-1"
                  : "text-rf-secondary hover:text-rf-primary"
              }`}
            >
              Upload
            </Link>
            <Link
              href="/watch"
              className={`font-[family-name:var(--font-space-grotesk)] uppercase tracking-tighter text-sm font-bold px-2 py-1 transition-colors ${
                activeLink === "watch"
                  ? "text-rf-primary border-b-4 border-rf-tertiary pb-1"
                  : "text-rf-secondary hover:text-rf-primary"
              }`}
            >
              My Videos
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] text-rf-secondary uppercase hidden sm:inline">
              {userEmail}
            </span>
          )}
          {signOutAction ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="font-[family-name:var(--font-space-grotesk)] uppercase tracking-tighter text-sm font-bold text-rf-secondary hover:text-rf-primary transition-colors"
              >
                Sign Out
              </button>
            </form>
          ) : (
            <Link
              href="/signin"
              className="font-[family-name:var(--font-space-grotesk)] uppercase tracking-tighter text-sm font-bold text-rf-secondary hover:text-rf-primary transition-colors"
            >
              Sign Out
            </Link>
          )}
          <div className="w-10 h-10 bg-rf-surface-container-high border border-rf-primary overflow-hidden flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rf-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
