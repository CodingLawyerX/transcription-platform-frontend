'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;
  const isLoading = status === 'loading';

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(28,45,58,0.08)] bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white text-sm font-semibold">
              SA
            </span>
            <span className="text-lg font-semibold tracking-tight text-text">
              Simpliant App
            </span>
          </Link>
          <div className="hidden items-center gap-4 text-sm font-medium text-muted-strong sm:flex">
            <Link className="transition-colors hover:text-text" href="/">
              Start
            </Link>
            <Link className="transition-colors hover:text-text" href="/transcribe">
              Workspace
            </Link>
            <Link className="transition-colors hover:text-text" href="/profile">
              Profil
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="text-sm text-muted">Lade…</div>
          ) : isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="hidden rounded-full border border-[rgba(28,45,58,0.12)] px-4 py-2 text-sm font-medium text-text transition hover:border-[rgba(28,45,58,0.3)] sm:inline-flex"
              >
                Konto
              </Link>
              <button onClick={handleLogout} className="btn btn-outline">
                Abmelden
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Anmelden
              </Link>
              <Link href="/register" className="btn btn-primary">
                Registrieren
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
