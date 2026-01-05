'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
 defaultOptions: {
 queries: {
 staleTime: 5 * 60 * 1000, // 5 minutes
 retry: 1,
 },
 },
});

export function Providers({ children }: { children: React.ReactNode }) {
 return (
 <SessionProvider>
 <QueryClientProvider client={queryClient}>
 {children}
 </QueryClientProvider>
 </SessionProvider>
 );
}
