'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { colors, radius, space, shadow, gradients } from '@/lib/theme';

function ConsentVerifyContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [verifyStatus, setVerifyStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [consentDetails, setConsentDetails] = useState<any>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  useEffect(() => {
    verifyConsent();
  }, []);

  const verifyConsent = async () => {
    if (!token) {
      setVerifyStatus('error');
      setErrorMessage('Invalid consent verification link. Please check your email for the correct link.');
      setIsLoading(false);
      return;
    }

    try {
      // In production, this would call the API to verify the consent token
      // const response = await api.verifyParentalConsent(token);
      setConsentDetails({
        scoutName: 'Your Scout',
        parentName: 'Parent'
      });
      setVerifyStatus('pending');
    } catch (err: any) {
      setVerifyStatus('error');
      setErrorMessage(err.message || 'Invalid or expired consent link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // In production: await api.approveParentalConsent(token);
      setVerifyStatus('success');
    } catch (err: any) {
      setVerifyStatus('error');
      setErrorMessage(err.message || 'Failed to approve consent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    setIsLoading(true);
    try {
      // In production: await api.denyParentalConsent(token);
      setVerifyStatus('error');
      setErrorMessage('Consent has been denied. Your scout will not be able to participate in Camp Card fundraising at this time.');
    } catch (err: any) {
      setVerifyStatus('error');
      setErrorMessage(err.message || 'Failed to process your response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <p style={{ fontSize: '16px', color: colors.muted }}>Processing your consent verification...</p>
        </div>
      </div>
    );
  }

  if (verifyStatus === 'success') {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: colors.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '40px', height: '40px', color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Consent Approved!</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: '0 0 24px 0' }}>
            Thank you for approving {consentDetails?.scoutName}'s participation in Camp Card fundraising. They can now start their fundraising journey!
          </p>
          <Link href="/login" style={{ display: 'block', width: '100%', padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.white, background: gradients.primary, border: 'none', borderRadius: radius.button, textAlign: 'center', textDecoration: 'none', boxShadow: shadow.md, boxSizing: 'border-box' }}>
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  if (verifyStatus === 'error') {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: colors.errorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '40px', height: '40px', color: colors.error }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Consent Not Processed</h1>
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
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Parental Consent Required</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>
            Your consent is required for {consentDetails?.scoutName} to participate in Camp Card fundraising.
          </p>
        </div>

        <div style={{ background: colors.gray50, padding: space.md, borderRadius: radius.md, marginBottom: space.lg }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 8px 0' }}>What Camp Card Does:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: colors.muted }}>
            <li style={{ marginBottom: '4px' }}>Enables scouts to participate in digital fundraising</li>
            <li style={{ marginBottom: '4px' }}>Allows tracking of fundraising progress</li>
            <li style={{ marginBottom: '4px' }}>Provides access to exclusive merchant offers</li>
            <li style={{ marginBottom: '4px' }}>Connects parents to support their scout's journey</li>
          </ul>
        </div>

        <div style={{ background: colors.warningLight, padding: space.md, borderRadius: radius.md, marginBottom: space.lg }}>
          <p style={{ fontSize: '13px', color: colors.text, margin: 0 }}>
            <strong>Note:</strong> By approving, you agree to the Camp Card Terms of Service and Privacy Policy. Your scout's basic profile information will be visible to their troop leader.
          </p>
        </div>

        <div style={{ display: 'flex', gap: space.md }}>
          <button
            onClick={handleDeny}
            style={{ flex: 1, padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.text, backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.button, cursor: 'pointer' }}
          >
            Deny
          </button>
          <button
            onClick={handleApprove}
            style={{ flex: 1, padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.white, background: gradients.primary, border: 'none', borderRadius: radius.button, cursor: 'pointer', boxShadow: shadow.md }}
          >
            Approve
          </button>
        </div>

        <p style={{ fontSize: '12px', color: colors.muted, textAlign: 'center', marginTop: space.md }}>
          Questions? Contact <a href="mailto:support@campcardapp.org" style={{ color: colors.accent }}>support@campcardapp.org</a>
        </p>
      </div>
    </div>
  );
}

export default function ConsentVerifyPage() {
  return (
    <Suspense fallback={<div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: colors.white }}>Loading...</p></div>}>
      <ConsentVerifyContent />
    </Suspense>
  );
}
