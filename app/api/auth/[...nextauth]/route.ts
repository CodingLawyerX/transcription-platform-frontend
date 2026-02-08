import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const getBackendBaseUrl = () => {
  // For server-side requests in Docker, use the internal Docker network URL
  // This is available at runtime through env vars
  const internal = process.env['NEXTAUTH_INTERNAL_BACKEND_URL'];
  if (internal?.trim()) {
    console.log('[Auth] Using internal backend URL:', internal.trim());
    return internal.trim();
  }

  const configured = process.env['NEXTAUTH_BACKEND_URL'];
  if (configured?.trim()) {
    console.log('[Auth] Using configured backend URL:', configured.trim());
    return configured.trim();
  }

  const publicUrl = process.env['NEXT_PUBLIC_API_URL'];
  if (publicUrl?.trim()) {
    console.log('[Auth] Using public API URL:', publicUrl.trim());
    return publicUrl.trim();
  }

  console.log('[Auth] Using default localhost URL');
  return 'http://localhost:8120/rest/api/v1';
};

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const backendUrl = getBackendBaseUrl().replace(/\/+$/, '');
          const loginUrl = `${backendUrl}/auth/login/`;
          console.log('Attempting login to:', loginUrl);
          
          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            try {
              const errorData = await response.clone().json();
              console.error('Login failed:', response.status, errorData);
            } catch {
              const errorText = await response.clone().text();
              console.error('Login failed:', response.status, errorText);
            }
            return null;
          }

          let data;
          try {
            data = await response.json();
          } catch (error) {
            console.error('Failed to parse response:', error);
            return null;
          }
          
          if (data.key && data.user) {
            return {
              id: String(data.user.id ?? data.user.username),
              email: data.user.email,
              name: data.user.username,
              token: data.key,
              ...data.user,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.accessToken = user.token;
        token.user = user;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      return session;
    },
  },
  useSecureCookies: (() => {
    const override = process.env.NEXTAUTH_USE_SECURE_COOKIES;
    if (override !== undefined) {
      return override === 'true';
    }
    return (process.env.NEXTAUTH_URL || '').startsWith('https://');
  })(),
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
