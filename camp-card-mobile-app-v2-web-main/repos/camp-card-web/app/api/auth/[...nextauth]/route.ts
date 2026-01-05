import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { mockUsers } from '@/lib/mockData';

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

 try {
 // First, try to authenticate with live backend
 // Use internal API URL for server-side calls (Docker network), fallback to public URL
 const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7010/api/v1';
 console.log('Attempting to authenticate with API:', `${apiUrl}/auth/login`);

 try {
 const response = await fetch(`${apiUrl}/auth/login`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 email: credentials.email,
 password: credentials.password,
 }),
 signal: AbortSignal.timeout(5000), // 5 second timeout
 });

 console.log('Auth response status:', response.status);

 if (response.ok) {
 const data = await response.json();
 console.log('Auth successful for user:', data.user?.email);

 // Map backend response to NextAuth user format
 return {
 id: data.user.id,
 email: data.user.email,
 name: data.user.full_name,
 role: data.user.role,
 accessToken: data.access_token,
 refreshToken: data.refresh_token,
 };
 }
 } catch (backendError) {
 console.log('Backend unavailable, falling back to mock authentication');
 }

 // Fallback: Use mock data for authentication
 console.log('Using mock authentication for:', credentials.email);

 // Allow demo credentials
 if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
 return {
 id: '0',
 email: 'test@example.com',
 name: 'Demo Admin',
 role: 'ADMIN',
 accessToken: 'mock-token',
 refreshToken: 'mock-refresh-token',
 };
 }

 // Find user in mock data by email
 const mockUsersList = mockUsers.content || mockUsers;
 const mockUser = Array.isArray(mockUsersList)
 ? mockUsersList.find(u => u.email?.toLowerCase() === credentials.email.toLowerCase())
 : null;

 if (mockUser) {
 // For mock authentication, accept any password
 return {
 id: mockUser.id || 'unknown',
 email: mockUser.email,
 name: `${mockUser.firstName} ${mockUser.lastName}`,
 role: mockUser.role,
 accessToken: 'mock-token',
 refreshToken: 'mock-refresh-token',
 };
 }

 throw new Error('User not found');
 } catch (error) {
 console.error('Auth error:', error);
 throw error;
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
 if (user) {
 token.id = user.id;
 token.email = user.email;
 token.name = user.name;
 token.role = user.role;
 token.accessToken = user.accessToken;
 token.refreshToken = user.refreshToken;
 }
 return token;
 },
 async session({ session, token }) {
 if (session.user) {
 session.user.id = token.id;
 session.user.role = token.role;
 (session.user as any).accessToken = token.accessToken;
 (session.user as any).refreshToken = token.refreshToken;
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
