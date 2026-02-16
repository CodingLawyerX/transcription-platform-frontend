'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, RegisterData, formatApiErrors } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    name: '',
    password1: '',
    password2: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setSuccessEmail(null);

    const validationErrors: string[] = [];

    if (!formData.email.trim()) {
      validationErrors.push('Email ist erforderlich');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      validationErrors.push('Ungültige Email-Adresse');
    }

    if (!formData.password1) {
      validationErrors.push('Passwort ist erforderlich');
    } else if (formData.password1.length < 8) {
      validationErrors.push('Passwort muss mindestens 8 Zeichen lang sein');
    }

    if (formData.password1 !== formData.password2) {
      validationErrors.push('Passwörter stimmen nicht überein');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await authApi.register(formData);

      if (result.data) {
        setSuccessEmail(formData.email);
      } else if (result.error) {
        const apiErrors = formatApiErrors(result.error);
        setErrors(apiErrors);
      } else {
        setErrors(['Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.']);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(148,163,184,0.2),transparent_45%),radial-gradient(circle_at_60%_80%,rgba(30,64,175,0.12),transparent_40%)]" />
      <div className="absolute right-[-8%] top-12 h-72 w-72 rounded-full bg-[rgba(59,130,246,0.18)] blur-3xl animate-float" />
      <div className="absolute left-[-10%] bottom-10 h-80 w-80 rounded-full bg-[rgba(148,163,184,0.18)] blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg border-[hsl(var(--border))] bg-[hsl(var(--card))/0.92] shadow-soft">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Account erstellen</CardTitle>
            <CardDescription>
              Erstellen Sie Ihren Zugang für die Simpliant App.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successEmail ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-[hsl(var(--success-green))/0.25] bg-[hsl(var(--success-green))/0.08] px-4 py-3 text-sm text-[hsl(var(--success-green))]">
                  <p className="font-medium">Registrierung erfolgreich.</p>
                  <p className="mt-1">
                    Wir haben eine Bestätigungs-Email an <strong>{successEmail}</strong> gesendet.
                    Bitte öffnen Sie den Link in der Email, um Ihren Account zu aktivieren.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/verify-email?email=${encodeURIComponent(successEmail)}`)}
                  >
                    Zur Email-Verifizierung
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Zur Anmeldung</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {errors.length > 0 && (
                  <div className="rounded-lg border border-[hsl(var(--destructive))/0.25] bg-[hsl(var(--destructive))/0.08] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-muted-strong">
                    Email-Adresse
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-text shadow-sm transition focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))/0.2]"
                    placeholder="name@unternehmen.de"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-muted-strong">
                    Name (optional)
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-text shadow-sm transition focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))/0.2]"
                    placeholder="Vor- und Nachname"
                    value={formData.name || ''}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password1" className="text-sm font-medium text-muted-strong">
                    Passwort
                  </label>
                  <input
                    id="password1"
                    name="password1"
                    type="password"
                    required
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-text shadow-sm transition focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))/0.2]"
                    placeholder="Mindestens 8 Zeichen"
                    value={formData.password1}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password2" className="text-sm font-medium text-muted-strong">
                    Passwort bestätigen
                  </label>
                  <input
                    id="password2"
                    name="password2"
                    type="password"
                    required
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-text shadow-sm transition focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))/0.2]"
                    placeholder="Passwort wiederholen"
                    value={formData.password2}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Registrierung läuft …' : 'Account erstellen'}
                </Button>

                <p className="text-center text-sm text-muted-strong">
                  Bereits registriert?{' '}
                  <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                    Zur Anmeldung
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
