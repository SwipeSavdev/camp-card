'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { colors, radius, space, shadow, gradients } from '@/lib/theme';

export default function DownloadPage() {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'unknown'>('unknown');

  useEffect(() => {
    // Detect device type from user agent
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    }
  }, []);

  const appStoreUrl = 'https://apps.apple.com/app/camp-card/id123456789'; // Replace with actual App Store URL
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=org.bsa.campcard'; // Replace with actual Play Store URL

  const handleDownload = (platform: 'ios' | 'android') => {
    const url = platform === 'ios' ? appStoreUrl : playStoreUrl;
    window.location.href = url;
  };

  return (
    <div style={{ background: gradients.primary, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, boxShadow: shadow.lg }}>
        <div style={{ textAlign: 'center', marginBottom: space.xl }}>
          <Image src="/assets/images/council_logo.png" alt="Camp Card Logo" width={200} height={85} style={{ borderRadius: radius.md, margin: '0 auto 24px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0' }}>Get the Camp Card App</h1>
          <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>Download the app to access exclusive offers and support scout fundraising!</p>
        </div>

        {/* App Features */}
        <div style={{ background: colors.gray50, padding: space.md, borderRadius: radius.md, marginBottom: space.lg }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.primary100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <svg style={{ width: '20px', height: '20px', color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: 0 }}>Exclusive Discounts</h3>
              <p style={{ fontSize: '12px', color: colors.muted, margin: 0 }}>Access offers from local merchants</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.primary100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <svg style={{ width: '20px', height: '20px', color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: 0 }}>Support Scouts</h3>
              <p style={{ fontSize: '12px', color: colors.muted, margin: 0 }}>Every purchase helps fund scouting</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.primary100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <svg style={{ width: '20px', height: '20px', color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: 0 }}>Digital Card</h3>
              <p style={{ fontSize: '12px', color: colors.muted, margin: 0 }}>Show your QR code for instant savings</p>
            </div>
          </div>
        </div>

        {/* Download Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
          {/* iOS Button */}
          <button
            type="button"
            onClick={() => handleDownload('ios')}
            style={{
              width: '100%',
              padding: space.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: colors.white,
              backgroundColor: '#000',
              border: 'none',
              borderRadius: radius.button,
              cursor: 'pointer',
              boxShadow: shadow.md,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Download on App Store
          </button>

          {/* Android Button */}
          <button
            type="button"
            onClick={() => handleDownload('android')}
            style={{
              width: '100%',
              padding: space.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: colors.white,
              background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
              border: 'none',
              borderRadius: radius.button,
              cursor: 'pointer',
              boxShadow: shadow.md,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35l9.37 8.85-9.37 8.85c-.5-.25-.84-.76-.84-1.35zm13.5-4.97l-2.33-2.2 2.33-2.2 2.67 1.52c.52.3.52 1.07 0 1.36l-2.67 1.52zm-3.12-2.2l-8.94-8.44c.5.27.95.64 1.32 1.09l6.74 6.36-6.74 6.35c-.37.46-.82.83-1.32 1.09l8.94-8.45zm-9.38-10c.77 0 1.39.32 1.39 1.42v13c0 1.1-.62 1.42-1.39 1.42v-15.84z" />
            </svg>
            Get it on Google Play
          </button>
        </div>

        {/* Detect & Recommend */}
        {deviceType !== 'unknown' && (
          <p style={{ fontSize: '12px', color: colors.muted, textAlign: 'center', marginTop: space.md }}>
            We detected you&apos;re on {deviceType === 'ios' ? 'iOS' : 'Android'}. Tap the {deviceType === 'ios' ? 'App Store' : 'Google Play'} button above!
          </p>
        )}

        {/* Alternative Links */}
        <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: space.lg, paddingTop: space.md, textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: colors.muted, margin: '0 0 8px 0' }}>Or scan the QR code with your phone camera</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: space.md }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: colors.gray50, borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                <span style={{ fontSize: '10px', color: colors.muted }}>iOS QR</span>
              </div>
              <span style={{ fontSize: '10px', color: colors.muted }}>App Store</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: colors.gray50, borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                <span style={{ fontSize: '10px', color: colors.muted }}>Android QR</span>
              </div>
              <span style={{ fontSize: '10px', color: colors.muted }}>Play Store</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: colors.muted, textAlign: 'center', marginTop: space.md }}>
          <Link href="/login" style={{ color: colors.accent }}>Already have the app? Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
