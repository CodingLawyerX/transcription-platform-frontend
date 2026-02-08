import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Passwort zurücksetzen - Simpliant App',
  description: 'Setzen Sie Ihr Passwort mit dem erhaltenen Link zurück',
};

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ uid?: string }>;
}

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
  const { token } = await params;
  const { uid } = await searchParams;

  return <ResetPasswordForm token={token} uid={uid} />;
}
