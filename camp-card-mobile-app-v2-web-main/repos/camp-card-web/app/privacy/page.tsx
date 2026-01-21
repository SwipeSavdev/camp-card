'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
        Privacy Policy
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Last Updated: January 21, 2026
      </p>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          1. Introduction
        </h2>
        <p>
          BSA Camp Card (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy of all users,
          especially children. This Privacy Policy explains how we collect, use, disclose, and safeguard
          your information when you use the Camp Card platform, including our mobile application and
          web portal.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          2. Information We Collect
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '20px' }}>
          2.1 Information from Adults (Parents, Unit Leaders, Council Admins)
        </h3>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Name, email address, and phone number</li>
          <li>Account credentials (encrypted)</li>
          <li>Payment information (processed securely via Stripe - we never store full card numbers)</li>
          <li>Organization affiliation (council, troop/pack)</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '20px' }}>
          2.2 Information from/about Scouts (Minors Under 18)
        </h3>
        <p style={{ marginBottom: '12px' }}>
          <strong>We practice data minimization for youth users.</strong> We collect only the minimum
          information necessary for the fundraising program:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>First name only (no last name stored in Scout profiles)</li>
          <li>Date of birth (for age verification and COPPA compliance)</li>
          <li>Parent/guardian contact information (email, optional phone)</li>
          <li>Referral code (for tracking fundraising progress)</li>
          <li>Troop/pack association</li>
        </ul>
        <p style={{ fontWeight: '500', color: '#dc2626' }}>
          We do NOT collect from Scouts: Social Security numbers, home addresses, photos,
          browsing behavior, or any sensitive personal information.
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
          3. Children&apos;s Privacy (COPPA Compliance)
        </h2>
        <p style={{ marginBottom: '16px' }}>
          BSA Camp Card complies with the Children&apos;s Online Privacy Protection Act (COPPA).
          We take special precautions to protect the privacy of users under 13 years of age.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          3.1 Parental Consent Required
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Before any Scout under 18 can fully access the Camp Card app, we require verifiable
          parental consent. When a Unit Leader creates a Scout account:
        </p>
        <ol style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>A consent request email is sent to the parent/guardian</li>
          <li>The parent must review what data is collected and how it&apos;s used</li>
          <li>The parent must explicitly grant consent before the Scout can access the app</li>
          <li>Without parental consent, the Scout account remains in a restricted state</li>
        </ol>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          3.2 Location Access for Minors
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Location-based features (finding nearby offers) require additional parental consent
          for minors. Parents can:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Grant or deny location access during the consent process</li>
          <li>Enable or disable location access at any time through their parent dashboard</li>
          <li>Revoke location consent without affecting other app features</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          3.3 Parental Rights
        </h3>
        <p>Parents and guardians have the right to:</p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Review all data collected about their child</li>
          <li>Request deletion of their child&apos;s data</li>
          <li>Refuse further data collection</li>
          <li>Revoke consent at any time</li>
        </ul>
        <p>
          To exercise these rights, contact us at{' '}
          <a href="mailto:privacy@campcard.org" style={{ color: '#2563eb' }}>privacy@campcard.org</a>
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          4. How We Use Your Information
        </h2>
        <p style={{ marginBottom: '12px' }}>We use the information we collect to:</p>
        <ul style={{ paddingLeft: '24px' }}>
          <li>Operate the Camp Card fundraising platform</li>
          <li>Track and attribute subscription sales to Scouts</li>
          <li>Process payments securely</li>
          <li>Send fundraising progress updates to parents</li>
          <li>Provide customer support</li>
          <li>Improve our services</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p style={{ marginTop: '16px', fontWeight: '500' }}>
          We do NOT use Scout data for behavioral advertising, profiling, or marketing purposes.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          5. Information Sharing
        </h2>
        <p style={{ marginBottom: '12px' }}>We may share your information with:</p>
        <ul style={{ paddingLeft: '24px' }}>
          <li><strong>BSA Councils and Troops:</strong> Unit Leaders can view Scout fundraising progress within their troop</li>
          <li><strong>Payment Processors:</strong> Stripe processes payments (PCI DSS compliant)</li>
          <li><strong>Service Providers:</strong> Email delivery, hosting, and analytics (under strict data protection agreements)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
        </ul>
        <p style={{ marginTop: '16px', fontWeight: '500', color: '#16a34a' }}>
          We NEVER sell your personal information to third parties.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          6. Data Security
        </h2>
        <p style={{ marginBottom: '12px' }}>We implement industry-standard security measures:</p>
        <ul style={{ paddingLeft: '24px' }}>
          <li>All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
          <li>Passwords are hashed using BCrypt with high cost factor</li>
          <li>Payment data handled by PCI DSS Level 1 certified processors</li>
          <li>Regular security audits and penetration testing</li>
          <li>Multi-tenant isolation to protect council data</li>
          <li>Access controls and audit logging</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          7. Your Rights (GDPR/CCPA)
        </h2>
        <p style={{ marginBottom: '12px' }}>Depending on your location, you may have the right to:</p>
        <ul style={{ paddingLeft: '24px' }}>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Request correction of inaccurate data</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
          <li><strong>Opt-Out:</strong> Opt out of marketing communications</li>
        </ul>
        <p style={{ marginTop: '16px' }}>
          To exercise these rights, email{' '}
          <a href="mailto:privacy@campcard.org" style={{ color: '#2563eb' }}>privacy@campcard.org</a>{' '}
          or use the settings in your account.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          8. California Residents (CCPA)
        </h2>
        <p style={{ marginBottom: '12px' }}>
          California residents have additional rights under the California Consumer Privacy Act:
        </p>
        <ul style={{ paddingLeft: '24px' }}>
          <li>Right to know what personal information is collected</li>
          <li>Right to delete personal information</li>
          <li>Right to non-discrimination for exercising privacy rights</li>
        </ul>
        <p style={{ marginTop: '16px' }}>
          <strong>We do not sell personal information.</strong> For CCPA requests, contact us at{' '}
          <a href="mailto:privacy@campcard.org" style={{ color: '#2563eb' }}>privacy@campcard.org</a>.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          9. Data Retention
        </h2>
        <p>
          We retain personal information only as long as necessary for the purposes outlined in
          this policy. Scout data is retained for the duration of their participation in the
          fundraising program plus one year. Upon request, data can be deleted immediately
          (subject to legal retention requirements).
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          10. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any
          material changes by email or through the app. Continued use of the platform after
          changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          11. Contact Us
        </h2>
        <p>If you have questions about this Privacy Policy or our data practices:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
          <li>Email: <a href="mailto:privacy@campcard.org" style={{ color: '#2563eb' }}>privacy@campcard.org</a></li>
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
        <Link href="/terms" style={{ color: '#2563eb' }}>Terms of Service</Link>
        <Link href="/login" style={{ color: '#2563eb' }}>Back to Login</Link>
      </div>
    </div>
  );
}
