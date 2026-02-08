'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  callbackUrl?: string;
}

export default function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const safeCallbackUrl = useMemo(() => {
    if (callbackUrl && callbackUrl.startsWith('/')) {
      return callbackUrl;
    }
    return '/transcribe';
  }, [callbackUrl]);

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

    // Client-seitige Validierung
    const validationErrors: string[] = [];

    if (!formData.email.trim()) {
      validationErrors.push('Email ist erforderlich');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      validationErrors.push('Ungültige Email-Adresse');
    }

    if (!formData.password) {
      validationErrors.push('Passwort ist erforderlich');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: safeCallbackUrl,
      });

      if (result?.error) {
        setErrors(['Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.']);
      } else {
        window.location.assign(safeCallbackUrl);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(43,165,153,0.16),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(242,190,111,0.2),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(34,88,102,0.12),transparent_40%)]" />
      <div className="absolute right-[-8%] top-12 h-72 w-72 rounded-full bg-[rgba(69,178,167,0.2)] blur-3xl animate-float" />
      <div className="absolute left-[-10%] bottom-10 h-80 w-80 rounded-full bg-[rgba(242,190,111,0.16)] blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-[rgba(28,45,58,0.08)] bg-white/90 shadow-soft">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Anmelden</CardTitle>
            <CardDescription>
              Willkommen zurück bei der Simpliant App.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {errors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                  className="w-full rounded-lg border border-[rgba(36,52,98,0.18)] bg-white/95 px-4 py-3 text-sm text-text shadow-sm transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="name@unternehmen.de"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-muted-strong">
                  Passwort
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-lg border border-[rgba(36,52,98,0.18)] bg-white/95 px-4 py-3 text-sm text-text shadow-sm transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Anmeldung läuft …' : 'Anmelden'}
              </Button>

              <div className="flex flex-col gap-2 text-center text-sm text-muted-strong">
                <Link href="/forgot-password" className="hover:text-text">
                  Passwort vergessen?
                </Link>
                <span>
                  Neu hier?{' '}
                  <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                    Account erstellen
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
