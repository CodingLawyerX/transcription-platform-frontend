'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;
  const isLoading = status === 'loading';
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[var(--glass-bg)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-light)))] shadow-[0_6px_16px_hsl(var(--primary)/0.25)]">
              <Image
                src="/assets/simpliant-icon.svg"
                alt="Simpliant"
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
                priority
              />
            </span>
            <span className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">
              Simpliant Transcribe
            </span>
          </Link>
          <div className="hidden items-center gap-4 text-sm font-medium text-[hsl(var(--muted-foreground))] sm:flex">
            <Link
              className={`transition-colors hover:text-[hsl(var(--foreground))] ${pathname === '/' ? 'text-[hsl(var(--foreground))]' : ''}`}
              href="/"
              aria-current={pathname === '/' ? 'page' : undefined}
            >
              Start
            </Link>
            <Link
              className={`transition-colors hover:text-[hsl(var(--foreground))] ${pathname === '/transcribe' ? 'text-[hsl(var(--foreground))]' : ''}`}
              href="/transcribe"
              aria-current={pathname === '/transcribe' ? 'page' : undefined}
            >
              Workspace
            </Link>
            <Link
              className={`transition-colors hover:text-[hsl(var(--foreground))] ${pathname === '/profile' ? 'text-[hsl(var(--foreground))]' : ''}`}
              href="/profile"
              aria-current={pathname === '/profile' ? 'page' : undefined}
            >
              Profil
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Lade…</div>
          ) : isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="hidden rounded-full border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))/0.35] sm:inline-flex"
              >
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-light)))] shadow-[0_6px_16px_hsl(var(--primary)/0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_hsl(var(--primary)/0.3)]"
              >
                Abmelden
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))/0.35]"
              >
                Anmelden
              </Link>
              <Link
                href="/register"
                className="rounded-full px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-light)))] shadow-[0_6px_16px_hsl(var(--primary)/0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_hsl(var(--primary)/0.3)]"
              >
                Registrieren
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
