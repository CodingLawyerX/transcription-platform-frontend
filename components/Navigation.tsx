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
  const isHome = pathname === '/';
  const isTranscribe = pathname === '/transcribe';
  const isProfile = pathname === '/profile';

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav
      className={
        isHome
          ? 'fixed left-0 right-0 top-0 z-50 border-b border-[rgba(10,15,30,0.08)] bg-[rgba(248,249,252,0.82)] backdrop-blur-[20px] backdrop-saturate-[1.4]'
          : 'sticky top-0 z-50 border-b border-border bg-[var(--glass-bg)] backdrop-blur-xl'
      }
    >
      <div
        className={
          isHome
            ? 'mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-12'
            : 'mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6'
        }
      >
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            {isHome ? (
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#2d5bff] text-[15px] font-semibold text-white">
                S
              </span>
            ) : (
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
            )}
            <span
              className={
                isHome
                  ? 'text-[17px] font-semibold tracking-[-0.3px] text-[#0a0f1e]'
                  : 'text-lg font-semibold tracking-tight text-foreground'
              }
            >
              Simpliant Transcribe
            </span>
          </Link>
          <div
            className={
              isHome
                ? 'hidden items-center gap-1 text-[14px] font-medium text-[#6b7194] sm:flex'
                : 'hidden items-center gap-4 text-sm font-medium text-muted-foreground sm:flex'
            }
          >
            <Link
              className={
                isHome
                  ? `rounded-[8px] px-3 py-1.5 transition hover:bg-[rgba(45,91,255,0.12)] hover:text-[#0a0f1e] ${
                      isHome ? 'text-[#0a0f1e]' : ''
                    }`
                  : `transition-colors hover:text-foreground ${pathname === '/' ? 'text-foreground' : ''}`
              }
              href="/"
              aria-current={pathname === '/' ? 'page' : undefined}
            >
              Start
            </Link>
            <Link
              className={
                isHome
                  ? `rounded-[8px] px-3 py-1.5 transition hover:bg-[rgba(45,91,255,0.12)] hover:text-[#0a0f1e] ${
                      isTranscribe ? 'text-[#0a0f1e]' : ''
                    }`
                  : `transition-colors hover:text-foreground ${pathname === '/transcribe' ? 'text-foreground' : ''}`
              }
              href="/transcribe"
              aria-current={pathname === '/transcribe' ? 'page' : undefined}
            >
              Workspace
            </Link>
            <Link
              className={
                isHome
                  ? `rounded-[8px] px-3 py-1.5 transition hover:bg-[rgba(45,91,255,0.12)] hover:text-[#0a0f1e] ${
                      isProfile ? 'text-[#0a0f1e]' : ''
                    }`
                  : `transition-colors hover:text-foreground ${pathname === '/profile' ? 'text-foreground' : ''}`
              }
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
                className={
                  isHome
                    ? 'hidden rounded-[8px] border-[rgba(10,15,30,0.14)] bg-transparent text-[#0a0f1e] hover:bg-[#0a0f1e] hover:text-white sm:inline-flex'
                    : 'hidden rounded-full sm:inline-flex'
                }
              >
                <Link href="/profile">Profil</Link>
              </Button>
              <Button
                onClick={handleLogout}
                size="sm"
                className={
                  isHome
                    ? 'rounded-[8px] bg-[#0a0f1e] text-white hover:bg-[#2d5bff]'
                    : 'rounded-full'
                }
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
                className={
                  isHome
                    ? 'rounded-[8px] border-[rgba(10,15,30,0.14)] bg-transparent text-[#0a0f1e] hover:bg-[#0a0f1e] hover:text-white'
                    : 'rounded-full'
                }
              >
                <Link href="/login">Anmelden</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className={
                  isHome
                    ? 'rounded-[8px] bg-[#0a0f1e] text-white hover:bg-[#2d5bff]'
                    : 'rounded-full'
                }
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
