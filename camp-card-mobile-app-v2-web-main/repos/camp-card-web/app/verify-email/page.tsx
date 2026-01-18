'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { colors, radius, space, shadow, gradients } from '@/lib/theme';

function EmailVerificationContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('Invalid verification token. Please check your email for the correct link.');
      setIsLoading(false);
      return;
    }

    try {
      await api.verifyEmail(token);
      setVerificationStatus('success');
    } catch (err: any) {
      setVerificationStatus('error');
      setErrorMessage(err.message || 'Verification failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading || verificationStatus === 'loading') {
    return (
      <div
        style={{
          background: gradients.primary,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: space.lg,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            padding: space.xl,
            backgroundColor: colors.white,
            borderRadius: radius.lg,
            boxShadow: shadow.lg,
            position: 'relative',
            zIndex: 10,
            border: `1px solid ${colors.primary100}`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: space.lg,
            }}
          >
            <Image
              src="/assets/images/council_logo.png"
              alt="Camp Card Logo"
              width={200}
              height={85}
              style={{ borderRadius: radius.md }}
            />
          </div>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: colors.infoLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg
              style={{ width: '40px', height: '40px', color: colors.accent, animation: 'spin 1s linear infinite' }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>
            Verifying Your Email
          </h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>
            Please wait while we verify your email address...
          </p>
        </div>
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div
        style={{
          background: gradients.primary,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: space.lg,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.03)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            padding: space.xl,
            backgroundColor: colors.white,
            borderRadius: radius.lg,
            boxShadow: shadow.lg,
            position: 'relative',
            zIndex: 10,
            border: `1px solid ${colors.primary100}`,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: space.xl }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: space.lg,
              }}
            >
              <Image
                src="/assets/images/council_logo.png"
                alt="Camp Card Logo"
                width={200}
                height={85}
                style={{ borderRadius: radius.md }}
              />
            </div>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: colors.successLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <svg
                style={{ width: '40px', height: '40px', color: colors.success }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>
              Email Verified!
            </h1>
            <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>
              Your email has been successfully verified. You can now access all features of the BSA Camp Card platform.
            </p>
          </div>

          <div
            style={{
              padding: space.md,
              backgroundColor: colors.successLight,
              borderRadius: radius.md,
              border: `1px solid ${colors.success}`,
              marginBottom: space.xl,
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: '600', color: colors.success, margin: '0 0 8px 0' }}>
              What's next?
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: colors.green600 }}>
              <li style={{ marginBottom: '4px' }}>Sign in to your account</li>
              <li style={{ marginBottom: '4px' }}>Explore exclusive offers from local merchants</li>
              <li>Start saving with your Camp Card</li>
            </ul>
          </div>

          <Link
            href="/login"
            style={{
              display: 'block',
              width: '100%',
              padding: `${space.md} ${space.lg}`,
              fontSize: '16px',
              fontWeight: '600',
              color: colors.white,
              background: gradients.primary,
              border: 'none',
              borderRadius: radius.button,
              cursor: 'pointer',
              textAlign: 'center',
              textDecoration: 'none',
              boxShadow: shadow.md,
              boxSizing: 'border-box',
            }}
          >
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div
      style={{
        background: gradients.primary,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: space.lg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: space.xl,
          backgroundColor: colors.white,
          borderRadius: radius.lg,
          boxShadow: shadow.lg,
          position: 'relative',
          zIndex: 10,
          border: `1px solid ${colors.primary100}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: space.xl }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: space.lg,
            }}
          >
            <Image
              src="/assets/images/council_logo.png"
              alt="Camp Card Logo"
              width={200}
              height={85}
              style={{ borderRadius: radius.md }}
            />
          </div>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: colors.errorLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg
              style={{ width: '40px', height: '40px', color: colors.error }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>
            Verification Failed
          </h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>
            {errorMessage}
          </p>
        </div>

        <div
          style={{
            padding: space.md,
            backgroundColor: colors.errorLight,
            borderRadius: radius.md,
            border: `1px solid ${colors.error}`,
            marginBottom: space.xl,
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: '600', color: colors.error, margin: '0 0 8px 0' }}>
            Common issues:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: colors.red600 }}>
            <li style={{ marginBottom: '4px' }}>The verification link may have expired (valid for 7 days)</li>
            <li style={{ marginBottom: '4px' }}>The link may have already been used</li>
            <li>The link may be incomplete or corrupted</li>
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
          <button
            onClick={() => {
              setIsLoading(true);
              setVerificationStatus('loading');
              verifyEmail();
            }}
            style={{
              width: '100%',
              padding: `${space.md} ${space.lg}`,
              fontSize: '16px',
              fontWeight: '600',
              color: colors.white,
              background: gradients.primary,
              border: 'none',
              borderRadius: radius.button,
              cursor: 'pointer',
              boxShadow: shadow.md,
            }}
          >
            Try Again
          </button>
          <Link
            href="/login"
            style={{
              display: 'block',
              width: '100%',
              padding: `${space.md} ${space.lg}`,
              fontSize: '16px',
              fontWeight: '600',
              color: colors.text,
              backgroundColor: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.button,
              cursor: 'pointer',
              textAlign: 'center',
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            background: gradients.primary,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ color: colors.white, fontSize: '16px' }}>Loading...</p>
        </div>
      }
    >
      <EmailVerificationContent />
    </Suspense>
  );
}
