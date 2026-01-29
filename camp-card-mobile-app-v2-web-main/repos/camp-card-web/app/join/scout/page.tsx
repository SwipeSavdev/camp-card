'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { colors, radius, space, shadow, gradients } from '@/lib/theme';

function JoinScoutContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [joinStatus, setJoinStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  useEffect(() => {
    loadInviteDetails();
  }, []);

  const loadInviteDetails = async () => {
    if (!token) {
      setJoinStatus('error');
      setErrorMessage('Invalid invitation token. Please check your email for the correct link.');
      setIsLoading(false);
      return;
    }

    try {
      // Placeholder - API would validate token and return troop details
      setInviteDetails({
        troopNumber: 'Troop 123',
        inviterName: 'Your Troop Leader',
        councilName: 'Local Council'
      });
      setJoinStatus('pending');
    } catch (err: any) {
      setJoinStatus('error');
      setErrorMessage(err.message || 'Invalid or expired invitation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // API call would go here
      setJoinStatus('success');
    } catch (err: any) {
      setJoinStatus('error');
      setErrorMessage(err.message || 'Failed to join. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <p style={{ fontSize: '16px', color: colors.muted }}>Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (joinStatus === 'success') {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: colors.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '40px', height: '40px', color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Welcome to {inviteDetails?.troopNumber}!</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: '0 0 24px 0' }}>Your account has been created. Check your email to verify your account, then download the Camp Card app to get started!</p>
          <Link href="/login" style={{ display: 'block', width: '100%', padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.white, background: gradients.primary, border: 'none', borderRadius: radius.button, textAlign: 'center', textDecoration: 'none', boxShadow: shadow.md, boxSizing: 'border-box' }}>
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  if (joinStatus === 'error') {
    return (
      <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg, textAlign: 'center' }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: colors.errorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '40px', height: '40px', color: colors.error }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Invalid Invitation</h1>
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
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Join {inviteDetails?.troopNumber}</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>{inviteDetails?.inviterName} has invited you to join BSA Camp Card!</p>
        </div>

        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: space.md }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '4px' }}>First Name</label>
            <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} style={{ width: '100%', padding: space.sm, fontSize: '16px', border: `1px solid ${colors.border}`, borderRadius: radius.md, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: space.md }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '4px' }}>Last Name</label>
            <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} style={{ width: '100%', padding: space.sm, fontSize: '16px', border: `1px solid ${colors.border}`, borderRadius: radius.md, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: space.md }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '4px' }}>Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: space.sm, fontSize: '16px', border: `1px solid ${colors.border}`, borderRadius: radius.md, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: space.lg }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '4px' }}>Password</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: space.sm, fontSize: '16px', border: `1px solid ${colors.border}`, borderRadius: radius.md, boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: `${space.md} ${space.lg}`, fontSize: '16px', fontWeight: '600', color: colors.white, background: gradients.primary, border: 'none', borderRadius: radius.button, cursor: 'pointer', boxShadow: shadow.md }}>
            Create Account & Join
          </button>
        </form>
        <p style={{ fontSize: '12px', color: colors.muted, textAlign: 'center', marginTop: space.md }}>Already have an account? <Link href="/login" style={{ color: colors.accent }}>Sign in</Link></p>
      </div>
    </div>
  );
}

export default function JoinScoutPage() {
  return (
    <Suspense fallback={<div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: colors.white }}>Loading...</p></div>}>
      <JoinScoutContent />
    </Suspense>
  );
}
