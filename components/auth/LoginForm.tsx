'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-auth-glow" />
      <div className="absolute right-[-8%] top-12 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute left-[-10%] bottom-10 h-80 w-80 rounded-full bg-muted/40 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-border bg-card/90 shadow-soft">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Anmelden</CardTitle>
            <CardDescription>
              Willkommen zurück bei der Simpliant App.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Passwort
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Anmeldung läuft …' : 'Anmelden'}
              </Button>

              <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
                <Link href="/forgot-password" className="hover:text-foreground">
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
