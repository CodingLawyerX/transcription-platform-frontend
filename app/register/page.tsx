import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Registrierung - Simpliant App',
  description: 'Erstellen Sie einen neuen Account für die Simpliant App',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
