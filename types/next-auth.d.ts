import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    key?: string;
    user: DefaultSession['user'] & {
      id?: string;
      token?: string;
      name?: string;
      is_active?: boolean;
      is_staff?: boolean;
    };
  }

  interface User {
    token?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    user?: any;
  }
}
