'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, formatApiErrors } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Altcha from '@/components/auth/Altcha';
import type { AltchaRef } from '@/components/auth/Altcha';

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const altchaRef = useRef<AltchaRef>(null);
  const [formData, setFormData] = useState({
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

    const altchaValue = altchaRef.current?.value;
    if (!altchaValue) {
      validationErrors.push('Bitte lösen Sie das CAPTCHA.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await authApi.register({
        ...formData,
        altcha: altchaValue || undefined,
      });

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
      altchaRef.current?.reset();
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-auth-glow" />
      <div className="absolute right-[-8%] top-12 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute left-[-10%] bottom-10 h-80 w-80 rounded-full bg-muted/40 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg border-border bg-card/90 shadow-soft">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Account erstellen</CardTitle>
            <CardDescription>
              Erstellen Sie Ihren Zugang für die Simpliant App.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successEmail ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
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
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                    Name (optional)
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Vor- und Nachname"
                    value={formData.name || ''}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password1" className="text-sm font-medium text-muted-foreground">
                    Passwort
                  </label>
                  <Input
                    id="password1"
                    name="password1"
                    type="password"
                    required
                    placeholder="Mindestens 8 Zeichen"
                    value={formData.password1}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password2" className="text-sm font-medium text-muted-foreground">
                    Passwort bestätigen
                  </label>
                  <Input
                    id="password2"
                    name="password2"
                    type="password"
                    required
                    placeholder="Passwort wiederholen"
                    value={formData.password2}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <Altcha ref={altchaRef} />

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Registrierung läuft …' : 'Account erstellen'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
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
