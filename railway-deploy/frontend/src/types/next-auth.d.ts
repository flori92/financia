import NextAuth, { DefaultSession } from 'next-auth';

// Étendre les types NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      companyId: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    companyId: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    companyId: string;
  }
}
