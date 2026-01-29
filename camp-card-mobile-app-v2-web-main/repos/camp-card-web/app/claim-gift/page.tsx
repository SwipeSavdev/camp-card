'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { colors, radius, space, shadow, gradients } from '@/lib/theme';

function ClaimGiftContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [claimStatus, setClaimStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [giftDetails, setGiftDetails] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  useEffect(() => {
    loadGiftDetails();
  }, []);

  const loadGiftDetails = async () => {
    if (!token) {
      setClaimStatus('error');
      setErrorMessage('Invalid gift token. Please check your email for the correct link.');
      setIsLoading(false);
      return;
    }

    try {
      // For now, show a placeholder - the API endpoint would need to be implemented
      setGiftDetails({
        senderName: 'Your Friend',
        cardNumber: 'CC-XXXX-XXXX',
        expirationDate: 'December 31, 2026'
      });
      setClaimStatus('pending');
    } catch (err: any) {
      setClaimStatus('error');
      setErrorMessage(err.message || 'Unable to load gift details.');
    } finally {
      setIsLoading(false);
    }
  };

  const claimGift = async () => {
    setIsLoading(true);
    try {
      // API call would go here: await api.claimGift(token);
      setClaimStatus('success');
    } catch (err: any) {
      setClaimStatus('error');
      setErrorMessage(err.message || 'Failed to claim gift. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: colors.infoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '30px', height: '30px', color: colors.accent, animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Loading Gift Details</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>Please wait...</p>
        </div>
        <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (claimStatus === 'success') {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: colors.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '40px', height: '40px', color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Gift Claimed!</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: '0 0 24px 0' }}>Your Camp Card gift has been successfully claimed. You can now start using it to redeem offers!</p>
          <Link href="/login" style={{ display: 'block', width: '100%', padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.white, background: gradients.primary, border: 'none', borderRadius: radius.button, textAlign: 'center', textDecoration: 'none', boxShadow: shadow.md, boxSizing: 'border-box' }}>
            Sign In to Get Started
          </Link>
        </div>
      </div>
    );
  }

  if (claimStatus === 'error') {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: colors.errorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '40px', height: '40px', color: colors.error }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Unable to Claim Gift</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: '0 0 24px 0' }}>{errorMessage}</p>
          <Link href="/login" style={{ display: 'block', width: '100%', padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.text, backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.button, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Pending - show gift details and claim button
  return (
    <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg }}>
        <div style={{ textAlign: 'center', marginBottom: space.xl }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎁</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>You've Received a Gift!</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>{giftDetails?.senderName} has sent you a BSA Camp Card!</p>
        </div>

        <div style={{ padding: space.md, backgroundColor: colors.infoLight, borderRadius: radius.md, border: `1px solid ${colors.info}`, marginBottom: space.xl }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: colors.info, margin: '0 0 8px 0' }}>Gift Details</p>
          <p style={{ fontSize: '12px', color: colors.info, margin: '0 0 4px 0' }}>Card Number: {giftDetails?.cardNumber}</p>
          <p style={{ fontSize: '12px', color: colors.info, margin: 0 }}>Valid Until: {giftDetails?.expirationDate}</p>
        </div>

        <button onClick={claimGift} style={{ width: '100%', padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.white, background: gradients.primary, border: 'none', borderRadius: radius.button, cursor: 'pointer', boxShadow: shadow.md, marginBottom: space.md }}>
          Claim Your Gift
        </button>
        <p style={{ fontSize: '12px', color: colors.muted, textAlign: 'center', margin: 0 }}>By claiming, you'll create an account or sign in to receive your Camp Card.</p>
      </div>
    </div>
  );
}

export default function ClaimGiftPage() {
  return (
    <Suspense fallback={<div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: colors.white }}>Loading...</p></div>}>
      <ClaimGiftContent />
    </Suspense>
  );
}
