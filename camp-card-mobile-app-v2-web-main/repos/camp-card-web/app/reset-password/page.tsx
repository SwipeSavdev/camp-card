'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { colors, radius, space, shadow, gradients } from '@/lib/theme';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.');
    }
  }, [token]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api.resetPassword(token, newPassword);
      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (resetSuccess) {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>
              Password Reset Successful!
            </h1>
            <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>
              Your password has been successfully reset. You can now log in with your new password.
            </p>
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
            Go to Login
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: colors.text,
              textAlign: 'center',
              margin: '0 0 8px 0',
            }}
          >
            Reset Your Password
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: colors.muted,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Enter your new password below.
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

          {/* New Password Field */}
          <div style={{ marginBottom: space.lg }}>
            <label
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
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: `${space.md} 40px ${space.md} ${space.md}`,
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? (
                  <svg style={{ width: '20px', height: '20px', color: colors.gray400 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg style={{ width: '20px', height: '20px', color: colors.gray400 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: space.lg }}>
            <label
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
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: `${space.md} 40px ${space.md} ${space.md}`,
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
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showConfirmPassword ? (
                  <svg style={{ width: '20px', height: '20px', color: colors.gray400 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg style={{ width: '20px', height: '20px', color: colors.gray400 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div
            style={{
              padding: space.md,
              backgroundColor: colors.infoLight,
              borderRadius: radius.md,
              border: `1px solid ${colors.accent}`,
              marginBottom: space.lg,
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: '600', color: colors.accent, margin: '0 0 8px 0' }}>
              Password must contain:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: colors.primary600 }}>
              <li style={{ marginBottom: '4px' }}>At least 8 characters</li>
              <li style={{ marginBottom: '4px' }}>One uppercase letter</li>
              <li style={{ marginBottom: '4px' }}>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            style={{
              width: '100%',
              padding: `${space.md} ${space.lg}`,
              fontSize: '16px',
              fontWeight: '600',
              color: colors.white,
              background: gradients.primary,
              border: 'none',
              borderRadius: radius.button,
              cursor: isLoading || !token ? 'not-allowed' : 'pointer',
              opacity: isLoading || !token ? 0.8 : 1,
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
                Resetting...
              </span>
            ) : (
              'Reset Password'
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

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}
