import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Passwort vergessen - Simpliant App',
  description: 'Fordern Sie einen Link zum Zurücksetzen Ihres Passworts an',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
