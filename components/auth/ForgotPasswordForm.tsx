'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi, formatApiErrors } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setSuccess(false);

    const validationErrors: string[] = [];
    if (!email.trim()) {
      validationErrors.push('Email ist erforderlich');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      validationErrors.push('Ungültige Email-Adresse');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await authApi.requestPasswordReset(email);
      if (result.data) {
        setSuccess(true);
      } else if (result.error) {
        const apiErrors = formatApiErrors(result.error);
        setErrors(apiErrors);
      } else {
        setErrors(['Anfrage fehlgeschlagen. Bitte versuchen Sie es erneut.']);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-auth-glow" />
      <div className="absolute right-[-8%] top-12 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute left-[-10%] bottom-10 h-80 w-80 rounded-full bg-muted/40 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-border bg-card/90 shadow-soft">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Passwort zurücksetzen</CardTitle>
            <CardDescription>
              Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
                  <p className="font-medium">Email gesendet.</p>
                  <p className="mt-1">
                    Falls ein Konto mit <strong>{email}</strong> existiert, haben wir einen Link gesendet.
                    Bitte prüfen Sie Ihren Posteingang und den Spam-Ordner.
                  </p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Zur Anmeldung</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {errors.length > 0 && (
                  <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                    Email-Adresse
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@unternehmen.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Wird gesendet …' : 'Link senden'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Zurück zur{' '}
                  <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                    Anmeldung
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
