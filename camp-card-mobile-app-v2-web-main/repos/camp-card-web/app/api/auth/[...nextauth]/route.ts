import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';

// Helper function to refresh the access token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7010/api/v1';

    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      return {
        ...token,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? token.refreshToken,
        accessTokenExpires: Date.now() + 23 * 60 * 60 * 1000, // 23 hours (before 24h backend expiry)
      };
    }

    console.error('Failed to refresh token:', response.status);
    return { ...token, error: 'RefreshAccessTokenError' };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          throw new Error('Email and password are required');
        }

        // Use internal API URL for server-side calls (Docker network), fallback to public URL
        const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7010/api/v1';

        try {
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            signal: AbortSignal.timeout(30000), // 30 second timeout
          });

          if (response.ok) {
            const data = await response.json();

            // Map backend response to NextAuth user format
            return {
              id: data.user.id,
              email: data.user.email,
              name: `${data.user.firstName} ${data.user.lastName}`,
              role: data.user.role,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            };
          }

          // Handle specific error responses
          if (response.status === 401) {
            throw new Error('Invalid email or password');
          }

          if (response.status === 404) {
            throw new Error('User not found');
          }

          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Authentication failed');
        } catch (error) {
          console.error('Auth error:', error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Unable to connect to authentication service');
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + 23 * 60 * 60 * 1000; // 23 hours (before 24h backend expiry)
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session.user as Record<string, unknown>).accessToken = token.accessToken;
        (session.user as Record<string, unknown>).refreshToken = token.refreshToken;
      }
      // Pass error to client so it can handle re-authentication
      if (token.error) {
        (session as unknown as Record<string, unknown>).error = token.error;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret',
});

export { handler as GET, handler as POST };
