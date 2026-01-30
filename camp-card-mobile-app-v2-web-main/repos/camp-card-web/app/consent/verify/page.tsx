'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { colors, radius, space, shadow, gradients } from '@/lib/theme';
import { api } from '@/lib/api';

interface ConsentDetails {
  minorName?: string;
  parentName?: string;
  tokenValid?: boolean;
  status?: string;
  [key: string]: unknown;
}

function ConsentVerifyContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'pending' | 'success' | 'denied' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [consentDetails, setConsentDetails] = useState<ConsentDetails | null>(null);
  const [locationConsent, setLocationConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  useEffect(() => {
    verifyConsent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyConsent = async () => {
    if (!token) {
      setVerifyStatus('error');
      setErrorMessage('Invalid consent verification link. Please check your email for the correct link.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getConsentDetails(token);
      if (!response.tokenValid) {
        setVerifyStatus('error');
        setErrorMessage('This consent link has expired. Please contact your scout\'s Unit Leader to request a new consent email.');
        setIsLoading(false);
        return;
      }
      if (response.status === 'GRANTED') {
        setVerifyStatus('success');
        setConsentDetails(response);
        setIsLoading(false);
        return;
      }
      if (response.status === 'DENIED') {
        setVerifyStatus('denied');
        setConsentDetails(response);
        setIsLoading(false);
        return;
      }
      setConsentDetails(response);
      setVerifyStatus('pending');
    } catch (err) {
      setVerifyStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Invalid or expired consent link. Please contact your scout\'s Unit Leader.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await api.submitConsentDecision(token, true, locationConsent, marketingConsent);
      setVerifyStatus('success');
    } catch (err) {
      setVerifyStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to approve consent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeny = async () => {
    setIsSubmitting(true);
    try {
      await api.submitConsentDecision(token, false, false, false);
      setVerifyStatus('denied');
    } catch (err) {
      setVerifyStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to process your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <p style={{ fontSize: '16px', color: colors.muted }}>Verifying consent request...</p>
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
            Thank you for approving {consentDetails?.minorName || 'your scout'}&apos;s participation in Camp Card fundraising. They will receive an email to get started!
          </p>
          <p style={{ fontSize: '12px', color: colors.muted, marginTop: space.md }}>
            Questions? Contact <a href="mailto:support@campcardapp.org" style={{ color: colors.accent }}>support@campcardapp.org</a>
          </p>
        </div>
      </div>
    );
  }

  if (verifyStatus === 'denied') {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: colors.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '40px', height: '40px', color: '#856404' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Consent Denied</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: '0 0 24px 0' }}>
            Your decision has been recorded. {consentDetails?.minorName || 'Your scout'} will not be able to participate in Camp Card fundraising at this time. You can change your decision by contacting support.
          </p>
          <p style={{ fontSize: '12px', color: colors.muted, marginTop: space.md }}>
            Questions? Contact <a href="mailto:support@campcardapp.org" style={{ color: colors.accent }}>support@campcardapp.org</a>
          </p>
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
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Unable to Process Consent</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: '0 0 24px 0' }}>{errorMessage}</p>
          <p style={{ fontSize: '12px', color: colors.muted, marginTop: space.md }}>
            Questions? Contact <a href="mailto:support@campcardapp.org" style={{ color: colors.accent }}>support@campcardapp.org</a>
          </p>
        </div>
      </div>
    );
  }

  // Pending state - show consent form
  return (
    <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg }}>
        <div style={{ textAlign: 'center', marginBottom: space.xl }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Parental Consent Required</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>
            Hello {consentDetails?.parentName || 'Parent'}, your consent is required for <strong>{consentDetails?.minorName || 'your scout'}</strong> to participate in Camp Card fundraising.
          </p>
        </div>

        <div style={{ background: colors.gray50, padding: space.md, borderRadius: radius.md, marginBottom: space.lg }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 8px 0' }}>What Camp Card Does:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: colors.muted }}>
            <li style={{ marginBottom: '4px' }}>Enables scouts to participate in digital fundraising</li>
            <li style={{ marginBottom: '4px' }}>Allows tracking of fundraising progress</li>
            <li style={{ marginBottom: '4px' }}>Provides access to exclusive merchant offers</li>
            <li style={{ marginBottom: '4px' }}>Connects parents to support their scout&apos;s journey</li>
          </ul>
        </div>

        <div style={{ marginBottom: space.lg }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 12px 0' }}>Optional Permissions:</h3>

          <label htmlFor="field" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', cursor: 'pointer' }}>
            <input
id="field"
              type="checkbox"
              checked={locationConsent}
              onChange={(e) => setLocationConsent(e.target.checked)}
              style={{ marginTop: '2px', width: '18px', height: '18px', accentColor: colors.accent }}
            />
            <span style={{ fontSize: '13px', color: colors.text }}>
              <strong>Location Services</strong> - Allow your scout to find nearby participating merchants
            </span>
          </label>

          <label htmlFor="field-2" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
id="field-2"
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              style={{ marginTop: '2px', width: '18px', height: '18px', accentColor: colors.accent }}
            />
            <span style={{ fontSize: '13px', color: colors.text }}>
              <strong>Marketing Communications</strong> - Receive updates about new offers and fundraising tips
            </span>
          </label>
        </div>

        <div style={{ background: colors.warningLight, padding: space.md, borderRadius: radius.md, marginBottom: space.lg }}>
          <p style={{ fontSize: '13px', color: colors.text, margin: 0 }}>
            <strong>Note:</strong> By approving, you agree to the Camp Card{' '}
            <a href="/terms" target="_blank" style={{ color: colors.accent }}>Terms of Service</a> and{' '}
            <a href="/privacy" target="_blank" style={{ color: colors.accent }}>Privacy Policy</a>.
            Your scout&apos;s basic profile information will be visible to their troop leader.
          </p>
        </div>

        <div style={{ display: 'flex', gap: space.md }}>
          <button
            type="button"
            onClick={handleDeny}
            disabled={isSubmitting}
            style={{ flex: 1, padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.text, backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.button, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}
          >
            Deny
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={isSubmitting}
            style={{ flex: 1, padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.white, background: gradients.primary, border: 'none', borderRadius: radius.button, cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: shadow.md, opacity: isSubmitting ? 0.6 : 1 }}
          >
            {isSubmitting ? 'Processing...' : 'Approve'}
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
