'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const themeColors = {
 white: '#ffffff',
 gray50: '#f9fafb',
 gray600: '#4b5563',
 primary900: '#1e3a8a',
};

const themeSpace = { xl: '32px', lg: '24px' };
const themeRadius = { card: '12px' };

export default function RedemptionsPage() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 if (status === 'unauthenticated') router.push('/login');
 }, [status, router]);

 useEffect(() => {
 if (session) setLoading(false);
 }, [session]);

 if (status === 'loading') return null;
 if (!session) return null;

 return (
 <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: themeColors.gray50 }}>
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: `${themeSpace.xl} ${themeSpace.lg}` }}>
 <div style={{ marginBottom: themeSpace.xl }}>
 <h1 style={{ fontSize: '28px', fontWeight: '700', color: themeColors.primary900 }}>
 Redemptions
 </h1>
 <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0 }}>
 Track card redemptions and rewards
 </p>
 </div>
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, flex: 1 }}>
 <p style={{ color: themeColors.gray600 }}>Redemption data will appear here</p>
 </div>
 </div>
 </div>
 );
}
