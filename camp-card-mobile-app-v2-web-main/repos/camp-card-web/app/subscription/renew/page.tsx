'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { colors, radius, space, shadow, gradients } from '@/lib/theme';

function SubscriptionRenewContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [renewStatus, setRenewStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const userId = searchParams.get('userId') || '';

  useEffect(() => {
    loadSubscriptionDetails();
  }, []);

  const loadSubscriptionDetails = async () => {
    if (!token && !userId) {
      setRenewStatus('error');
      setErrorMessage('Invalid renewal link. Please check your email for the correct link or log in to your account.');
      setIsLoading(false);
      return;
    }

    try {
      // In production, this would call the API to get subscription details
      // const response = await api.getSubscriptionRenewalDetails(token || userId);
      setSubscriptionDetails({
        planName: 'Annual Camp Card',
        currentExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        renewalPrice: '$15.00',
        nextExpiry: new Date(Date.now() + 372 * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
      setRenewStatus('pending');
    } catch (err: any) {
      setRenewStatus('error');
      setErrorMessage(err.message || 'Unable to load subscription details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenew = async () => {
    setRenewStatus('processing');
    try {
      // In production, redirect to payment flow or process renewal
      // For authenticated users, this would initiate the payment process
      // await api.initiateRenewal(token || userId);

      // Simulate redirect to payment
      setTimeout(() => {
        setRenewStatus('success');
      }, 1500);
    } catch (err: any) {
      setRenewStatus('error');
      setErrorMessage(err.message || 'Failed to process renewal. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <p style={{ fontSize: '16px', color: colors.muted }}>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (renewStatus === 'processing') {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '48px', height: '48px', border: `4px solid ${colors.border}`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', color: colors.muted }}>Processing your renewal...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (renewStatus === 'success') {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: colors.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '40px', height: '40px', color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Subscription Renewed!</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: '0 0 24px 0' }}>
            Your Camp Card subscription has been successfully renewed. Your new expiration date is {subscriptionDetails?.nextExpiry}.
          </p>
          <Link href="/login" style={{ display: 'block', width: '100%', padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.white, background: gradients.primary, border: 'none', borderRadius: radius.button, textAlign: 'center', textDecoration: 'none', boxShadow: shadow.md, boxSizing: 'border-box' }}>
            Continue to App
          </Link>
        </div>
      </div>
    );
  }

  if (renewStatus === 'error') {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: colors.errorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '40px', height: '40px', color: colors.error }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Renewal Failed</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: '0 0 24px 0' }}>{errorMessage}</p>
          <Link href="/login" style={{ display: 'block', width: '100%', padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.text, backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.button, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg }}>
        <div style={{ textAlign: 'center', marginBottom: space.xl }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Renew Your Subscription</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>Keep enjoying Camp Card benefits by renewing your subscription today!</p>
        </div>

        <div style={{ background: colors.background, padding: space.md, borderRadius: radius.md, marginBottom: space.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: colors.muted }}>Current Plan</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{subscriptionDetails?.planName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: colors.muted }}>Expires</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: colors.warning }}>{subscriptionDetails?.currentExpiry}</span>
          </div>
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: colors.muted }}>Renewal Price</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: colors.primary }}>{subscriptionDetails?.renewalPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: colors.muted }}>New Expiry Date</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: colors.success }}>{subscriptionDetails?.nextExpiry}</span>
            </div>
          </div>
        </div>

        <div style={{ background: colors.successLight, padding: space.md, borderRadius: radius.md, marginBottom: space.lg }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 8px 0' }}>What You'll Continue to Get:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: colors.muted }}>
            <li style={{ marginBottom: '4px' }}>Access to exclusive merchant discounts</li>
            <li style={{ marginBottom: '4px' }}>Support scout fundraising goals</li>
            <li style={{ marginBottom: '4px' }}>Digital card for easy redemption</li>
            <li style={{ marginBottom: '4px' }}>New offers added throughout the year</li>
          </ul>
        </div>

        <button
          onClick={handleRenew}
          style={{ width: '100%', padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.white, background: gradients.primary, border: 'none', borderRadius: radius.button, cursor: 'pointer', boxShadow: shadow.md, marginBottom: space.md }}
        >
          Renew Now - {subscriptionDetails?.renewalPrice}
        </button>

        <p style={{ fontSize: '12px', color: colors.muted, textAlign: 'center' }}>
          Need help? Contact <a href="mailto:support@campcardapp.org" style={{ color: colors.accent }}>support@campcardapp.org</a>
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionRenewPage() {
  return (
    <Suspense fallback={<div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: colors.white }}>Loading...</p></div>}>
      <SubscriptionRenewContent />
    </Suspense>
  );
}
