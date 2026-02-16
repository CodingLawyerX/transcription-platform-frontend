'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (email) {
      setMessage(`Wir haben eine Verifizierungs-Email an ${email} gesendet. Bitte prüfen Sie Ihren Posteingang.`);
    }
  }, [email]);

  const handleResendEmail = async () => {
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await authApi.resendVerificationEmail(email);

      if (result.data) {
        setMessage(`Wir haben eine neue Verifizierungs-Email an ${email} gesendet.`);
      } else if (result.error) {
        setError(
          Array.isArray(result.error.error)
            ? result.error.error[0]
            : result.error.error || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
        );
      } else {
        setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(148,163,184,0.2),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(30,64,175,0.12),transparent_40%)]" />
      <div className="absolute right-[-8%] top-12 h-72 w-72 rounded-full bg-[rgba(59,130,246,0.18)] blur-3xl animate-float" />
      <div className="absolute left-[-10%] bottom-10 h-80 w-80 rounded-full bg-[rgba(148,163,184,0.18)] blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-[hsl(var(--border))] bg-[hsl(var(--card))/0.92] shadow-soft">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Email bestätigen</CardTitle>
            <CardDescription>
              Aktivieren Sie Ihren Account über den Link in der Email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div className="rounded-lg border border-[hsl(var(--success-green))/0.25] bg-[hsl(var(--success-green))/0.08] px-4 py-3 text-sm text-[hsl(var(--success-green))]">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-[hsl(var(--destructive))/0.25] bg-[hsl(var(--destructive))/0.08] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
                {error}
              </div>
            )}

            <div className="rounded-lg border border-[hsl(var(--warning-orange))/0.25] bg-[hsl(var(--warning-orange))/0.08] px-4 py-3 text-sm text-[hsl(var(--warning-orange))]">
              <ul className="list-disc list-inside space-y-1">
                <li>Überprüfen Sie auch Ihren Spam-Ordner.</li>
                <li>Der Verifizierungslink ist 24 Stunden gültig.</li>
                <li>Sie können die Email jederzeit erneut senden.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              {email && (
                <Button onClick={handleResendEmail} disabled={isLoading}>
                  {isLoading ? 'Wird gesendet …' : 'Verifizierungs-Email erneut senden'}
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href="/login">Zur Anmeldung</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/register">Neuen Account erstellen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
