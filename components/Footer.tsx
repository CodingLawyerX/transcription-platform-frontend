'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--glass-bg)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" />
        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Simpliant</span>
          <div className="flex flex-wrap gap-4">
            <span className="hover:text-foreground">Datenschutz</span>
            <span className="hover:text-foreground">Impressum</span>
            <span className="hover:text-foreground">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
