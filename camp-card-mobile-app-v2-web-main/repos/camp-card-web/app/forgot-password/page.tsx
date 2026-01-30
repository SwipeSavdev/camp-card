'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { colors, radius, space, shadow, gradients } from '@/lib/theme';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await api.forgotPassword(email.trim());
      setEmailSent(true);
    } catch (err) {
      // Don't reveal if email exists or not for security
      // Still show success message
      setEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Email sent success state
  if (emailSent) {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>
              Check Your Email
            </h1>
            <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
          </div>

          <div
            style={{
              padding: space.md,
              backgroundColor: colors.infoLight,
              borderRadius: radius.md,
              border: `1px solid ${colors.accent}`,
              marginBottom: space.xl,
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: '600', color: colors.accent, margin: '0 0 8px 0' }}>
              Didn&apos;t receive the email?
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: colors.primary600 }}>
              <li style={{ marginBottom: '4px' }}>Check your spam or junk folder</li>
              <li style={{ marginBottom: '4px' }}>Make sure you entered the correct email</li>
              <li>Wait a few minutes and try again</li>
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
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // Form state
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
        <div style={{ marginBottom: space.xl }}>
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
              style={{ width: '40px', height: '40px', color: colors.accent }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: space.sm,
              textAlign: 'center',
              margin: '0 0 8px 0',
            }}
          >
            Forgot Your Password?
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: colors.muted,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: space.md,
                marginBottom: space.lg,
                backgroundColor: colors.errorLight,
                borderRadius: radius.md,
                border: `1px solid ${colors.error}`,
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  color: colors.error,
                  margin: 0,
                  fontWeight: '600',
                }}
              >
                {error}
              </p>
            </div>
          )}

          <div style={{ marginBottom: space.lg }}>
            <label
              htmlFor="field"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: colors.text,
                marginBottom: space.sm,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: `${space.md} ${space.md}`,
                fontSize: '16px',
                border: `1px solid ${colors.border}`,
                borderRadius: radius.button,
                boxSizing: 'border-box',
                backgroundColor: colors.gray50,
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.accent;
                e.currentTarget.style.backgroundColor = colors.white;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.infoLight}`;
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.backgroundColor = colors.gray50;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: `${space.md} ${space.lg}`,
              fontSize: '16px',
              fontWeight: '600',
              color: colors.white,
              background: gradients.primary,
              border: 'none',
              borderRadius: radius.button,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.8 : 1,
              transition: 'all 0.2s ease',
              boxShadow: shadow.md,
              marginBottom: space.lg,
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg
                  style={{ width: '20px', height: '20px', marginRight: '8px', animation: 'spin 1s linear infinite' }}
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
                Sending...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link
              href="/login"
              style={{
                fontSize: '14px',
                color: colors.primary600,
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Remember your password? Sign in
            </Link>
          </div>
        </form>
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
