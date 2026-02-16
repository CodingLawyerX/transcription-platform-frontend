'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;
  const isLoading = status === 'loading';
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-[var(--glass-bg)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-primary-soft">
              <Image
                src="/assets/simpliant-icon.svg"
                alt="Simpliant"
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
                priority
              />
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Simpliant Transcribe
            </span>
          </Link>
          <div className="hidden items-center gap-4 text-sm font-medium text-muted-foreground sm:flex">
            <Link
              className={`transition-colors hover:text-foreground ${pathname === '/' ? 'text-foreground' : ''}`}
              href="/"
              aria-current={pathname === '/' ? 'page' : undefined}
            >
              Start
            </Link>
            <Link
              className={`transition-colors hover:text-foreground ${pathname === '/transcribe' ? 'text-foreground' : ''}`}
              href="/transcribe"
              aria-current={pathname === '/transcribe' ? 'page' : undefined}
            >
              Workspace
            </Link>
            <Link
              className={`transition-colors hover:text-foreground ${pathname === '/profile' ? 'text-foreground' : ''}`}
              href="/profile"
              aria-current={pathname === '/profile' ? 'page' : undefined}
            >
              Profil
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Lade…</div>
          ) : isLoggedIn ? (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden rounded-full sm:inline-flex"
              >
                <Link href="/profile">Profil</Link>
              </Button>
              <Button
                onClick={handleLogout}
                size="sm"
                className="rounded-full"
              >
                Abmelden
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-full"
              >
                <Link href="/login">Anmelden</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="rounded-full"
              >
                <Link href="/register">Registrieren</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
