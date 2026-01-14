'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  colors, radius, space, shadow, gradients,
} from '@/lib/theme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      {/* Decorative background elements */}
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

      {/* Login Card */}
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
        {/* Logo & Branding */}
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
              width={273}
              height={116}
              style={{
                borderRadius: radius.md,
              }}
            />
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: space.sm,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Camp Card
          </h1>
          <p
            style={{
              fontSize: '12px',
              color: colors.muted,
              textAlign: 'center',
              marginBottom: space.sm,
              fontWeight: '500',
            }}
          >
            Admin Portal
          </p>
          <p
            style={{
              fontSize: '11px',
              color: colors.primary600,
              textAlign: 'center',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            Manage scouts, leaders, merchants, and offers with our modern admin dashboard
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
                margin: '0 0 4px 0',
                fontWeight: '600',
              }}
            >
              Sign In Failed
            </p>
            <p style={{ fontSize: '12px', color: '#991B1B', margin: 0 }}>
              {error === 'CredentialsSignin'
                ? 'Invalid email or password. Please check the demo credentials below.'
                : error}
            </p>
          </div>
          )}

          {/* Email Field */}
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
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@campcard.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* Password Field */}
          <div style={{ marginBottom: space.xl }}>
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
              Password
            </label>
            <input
              type="password"
              required
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: `${space.md} ${space.lg}`,
              fontSize: '16px',
              fontWeight: '600',
              color: colors.white,
              background: gradients.primary,
              border: 'none',
              borderRadius: radius.button,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
              transition: 'all 0.2s ease',
              boxShadow: shadow.md,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = shadow.lg;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = shadow.md;
            }}
          >
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{ marginTop: space.xl, paddingTop: space.xl, borderTop: `1px solid ${colors.border}` }}>
          <p
            style={{
              fontSize: '12px',
              color: colors.primary600,
              marginBottom: space.md,
              fontWeight: '600',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Demo Credentials
          </p>
          <div
            style={{
              padding: space.md,
              backgroundColor: colors.primary50,
              borderRadius: radius.md,
              border: `1px solid ${colors.primary200}`,
            }}
          >
            <div style={{ marginBottom: space.sm }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.text,
                  margin: '0 0 4px 0',
                }}
              >
                Email
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: colors.primary600,
                  margin: 0,
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px',
                }}
              >
                admin@campcard.org
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.text,
                  margin: '0 0 4px 0',
                }}
              >
                Password
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: colors.primary600,
                  margin: 0,
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px',
                }}
              >
                Password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
