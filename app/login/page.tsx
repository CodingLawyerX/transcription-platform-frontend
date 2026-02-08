import LoginForm from '@/components/auth/LoginForm';

type LoginPageProps = {
  searchParams?: {
    callbackUrl?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const rawCallback = searchParams?.callbackUrl;
  const callbackUrl =
    typeof rawCallback === 'string' && rawCallback.startsWith('/') ? rawCallback : undefined;

  return <LoginForm callbackUrl={callbackUrl} />;
}
