'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1f2937',
      lineHeight: '1.7',
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
        Terms of Service
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Last Updated: January 21, 2026
      </p>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using the BSA Camp Card platform (&quot;Service&quot;), you agree to be bound
          by these Terms of Service and our Privacy Policy. If you do not agree to these terms,
          please do not use the Service.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          2. Description of Service
        </h2>
        <p>
          BSA Camp Card is a digital fundraising platform that enables Boy Scouts of America
          troops, packs, and councils to manage Camp Card subscription sales. The Service
          includes a mobile application, web portal, and related services.
        </p>
      </section>

      <section style={{
        marginBottom: '32px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#b45309' }}>
          3. Age Requirements and Parental Consent
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          3.1 Age Restrictions
        </h3>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Users must be at least 13 years old to create an account independently</li>
          <li>Users under 18 (&quot;Minors&quot;) require parental or guardian consent</li>
          <li>Scout accounts are created by Unit Leaders, not directly by Scouts</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          3.2 Parental Consent for Minors
        </h3>
        <p style={{ marginBottom: '12px' }}>
          In compliance with the Children&apos;s Online Privacy Protection Act (COPPA) and state
          privacy laws, we require verifiable parental consent before any minor can fully
          access the Camp Card platform. This includes:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Consent for data collection and use as described in our Privacy Policy</li>
          <li>Separate consent for location-based features</li>
          <li>The right to review, modify, or delete your child&apos;s data</li>
          <li>The right to revoke consent at any time</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          3.3 Parent/Guardian Responsibilities
        </h3>
        <p>If you are the parent or guardian of a minor using this Service, you:</p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Confirm you have the legal authority to consent on behalf of the minor</li>
          <li>Accept responsibility for the minor&apos;s use of the Service</li>
          <li>Agree to supervise the minor&apos;s activities on the platform</li>
          <li>Accept these Terms on behalf of the minor</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          4. User Accounts
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          4.1 Account Types
        </h3>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Scout:</strong> Youth participants in the fundraising program</li>
          <li><strong>Parent:</strong> Parent/guardian of a Scout</li>
          <li><strong>Unit Leader:</strong> Troop/pack leaders who manage Scout accounts</li>
          <li><strong>Council Admin:</strong> Council-level administrators</li>
          <li><strong>National Admin:</strong> BSA national organization administrators</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          4.2 Account Security
        </h3>
        <p>You are responsible for:</p>
        <ul style={{ paddingLeft: '24px' }}>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized use</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          5. Acceptable Use
        </h2>
        <p style={{ marginBottom: '12px' }}>You agree NOT to:</p>
        <ul style={{ paddingLeft: '24px' }}>
          <li>Use the Service for any unlawful purpose</li>
          <li>Impersonate any person or entity</li>
          <li>Attempt to gain unauthorized access to other accounts</li>
          <li>Interfere with the proper operation of the Service</li>
          <li>Upload malicious code or content</li>
          <li>Collect information about other users without consent</li>
          <li>Use the Service to harass, abuse, or harm others</li>
          <li>Manipulate or falsify fundraising data</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          6. Subscriptions and Payments
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          6.1 Subscription Plans
        </h3>
        <p>
          Camp Card offers various subscription plans with different benefits and pricing.
          Details of each plan are available within the app and during the subscription process.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          6.2 Payment Processing
        </h3>
        <p>
          Payments are processed securely through Stripe. By making a purchase, you agree
          to Stripe&apos;s terms of service. We do not store your full credit card information.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          6.3 Refunds
        </h3>
        <p>
          Refund policies are outlined at the time of purchase. Generally, subscriptions
          may be refunded within 14 days if no offers have been redeemed.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          7. Intellectual Property
        </h2>
        <p>
          The Service and its original content, features, and functionality are owned by
          BSA Camp Card and are protected by intellectual property laws. You may not copy,
          modify, distribute, or create derivative works without our written permission.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          8. Privacy
        </h2>
        <p>
          Your privacy is important to us. Please review our{' '}
          <Link href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</Link>{' '}
          to understand how we collect, use, and protect your information. The Privacy
          Policy is incorporated into these Terms by reference.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          9. Limitation of Liability
        </h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, BSA CAMP CARD SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
          LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF
          THE SERVICE.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          10. Disclaimer of Warranties
        </h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
          KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS
          FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          11. Termination
        </h2>
        <p>
          We may terminate or suspend your account at any time for violation of these Terms
          or for any other reason at our discretion. Upon termination, your right to use
          the Service will immediately cease. Parents may request account deletion for
          their minor children at any time.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          12. Changes to Terms
        </h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of
          any material changes via email or through the Service. Continued use after changes
          constitutes acceptance of the new Terms.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          13. Governing Law
        </h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of
          the State of Texas, without regard to its conflict of law provisions.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          14. Contact Information
        </h2>
        <p>For questions about these Terms:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
          <li>Email: <a href="mailto:legal@campcard.org" style={{ color: '#2563eb' }}>legal@campcard.org</a></li>
          <li>Address: BSA Camp Card, [Address to be added]</li>
        </ul>
      </section>

      <div style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '20px',
      }}>
        <Link href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</Link>
        <Link href="/login" style={{ color: '#2563eb' }}>Back to Login</Link>
      </div>
    </div>
  );
}
