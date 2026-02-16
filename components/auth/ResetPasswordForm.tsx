'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, formatApiErrors } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ResetPasswordFormProps {
  token: string;
  uid?: string;
}

export default function ResetPasswordForm({ token, uid }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    newPassword1: '',
    newPassword2: '',
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

    const validationErrors: string[] = [];
    if (!formData.newPassword1) {
      validationErrors.push('Passwort ist erforderlich');
    } else if (formData.newPassword1.length < 8) {
      validationErrors.push('Passwort muss mindestens 8 Zeichen lang sein');
    }

    if (formData.newPassword1 !== formData.newPassword2) {
      validationErrors.push('Passwörter stimmen nicht überein');
    }

    if (!uid) {
      validationErrors.push('Ungültiger Reset-Link (uid fehlt)');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await authApi.confirmPasswordReset(
        uid!,
        token,
        formData.newPassword1,
        formData.newPassword2
      );
      if (result.data) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else if (result.error) {
        const apiErrors = formatApiErrors(result.error);
        setErrors(apiErrors);
      } else {
        setErrors(['Zurücksetzen fehlgeschlagen. Bitte versuchen Sie es erneut.']);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.']);
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
            <CardTitle className="text-2xl font-semibold">Neues Passwort setzen</CardTitle>
            <CardDescription>Geben Sie Ihr neues Passwort ein.</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-[hsl(var(--success-green))/0.25] bg-[hsl(var(--success-green))/0.08] px-4 py-3 text-sm text-[hsl(var(--success-green))]">
                  <p className="font-medium">Passwort geändert.</p>
                  <p className="mt-1">
                    Sie werden in Kürze zur Anmeldung weitergeleitet.
                  </p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Jetzt anmelden</Link>
                </Button>
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
                  <label htmlFor="newPassword1" className="text-sm font-medium text-muted-strong">
                    Neues Passwort
                  </label>
                  <input
                    id="newPassword1"
                    name="newPassword1"
                    type="password"
                    required
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-text shadow-sm transition focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))/0.2]"
                    placeholder="Mindestens 8 Zeichen"
                    value={formData.newPassword1}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword2" className="text-sm font-medium text-muted-strong">
                    Passwort bestätigen
                  </label>
                  <input
                    id="newPassword2"
                    name="newPassword2"
                    type="password"
                    required
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-text shadow-sm transition focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))/0.2]"
                    placeholder="Passwort wiederholen"
                    value={formData.newPassword2}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Wird gespeichert …' : 'Passwort zurücksetzen'}
                </Button>

                <p className="text-center text-sm text-muted-strong">
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
