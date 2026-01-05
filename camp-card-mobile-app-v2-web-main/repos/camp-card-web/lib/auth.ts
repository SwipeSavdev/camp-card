import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
 providers: [
 CredentialsProvider({
 name: 'Credentials',
 credentials: {
 email: { label: 'Email', type: 'email' },
 password: { label: 'Password', type: 'password' },
 },
 async authorize(credentials) {
 if (!credentials?.email || !credentials?.password) {
 return null;
 }

 try {
 // Call your backend API to validate credentials
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
 {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 email: credentials.email,
 password: credentials.password,
 }),
 },
 );

 if (!response.ok) {
 return null;
 }

 const data = await response.json();

 return {
 id: data.user.id,
 email: data.user.email,
 name: `${data.user.firstName} ${data.user.lastName}`,
 role: data.user.role,
 accessToken: data.accessToken,
 refreshToken: data.refreshToken,
 };
 } catch (error) {
 // eslint-disable-next-line no-console
 console.error('Auth error:', error);
 return null;
 }
 },
 }),
 ],
 callbacks: {
 async jwt({ token, user }) {
 if (user) {
 return {
 ...token,
 id: user.id,
 role: user.role,
 accessToken: user.accessToken,
 refreshToken: user.refreshToken,
 };
 }
 return token;
 },
 async session({ session, token }) {
 if (token) {
 return {
 ...session,
 user: {
 ...session.user,
 id: token.id as string,
 role: token.role as string,
 },
 accessToken: token.accessToken as string,
 refreshToken: token.refreshToken as string,
 };
 }
 return session;
 },
 },
 pages: {
 signIn: '/login',
 },
 session: {
 strategy: 'jwt',
 },
 secret: process.env.NEXTAUTH_SECRET,
};
