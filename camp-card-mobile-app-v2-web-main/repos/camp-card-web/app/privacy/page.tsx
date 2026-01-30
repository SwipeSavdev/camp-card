'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div style={{
      maxWidth: '860px',
      margin: '0 auto',
      padding: '48px 24px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1f2937',
      lineHeight: '1.8',
      fontSize: '16px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '8px',
          color: '#111827',
          letterSpacing: '-0.02em',
        }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '4px' }}>
          <strong>Effective Date:</strong> January 30, 2026
        </p>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '4px' }}>
          <strong>Last Updated:</strong> January 30, 2026
        </p>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>
          <strong>Published by:</strong> Swipe Savvy, LLC
        </p>
      </div>

      {/* Table of Contents */}
      <nav style={{
        marginBottom: '48px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        padding: '24px 28px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>
          Table of Contents
        </h2>
        <ol style={{ paddingLeft: '20px', margin: 0, columns: 2, columnGap: '32px', fontSize: '14px', lineHeight: '2.2' }}>
          <li><a href="#introduction" style={{ color: '#2563eb', textDecoration: 'none' }}>Introduction</a></li>
          <li><a href="#information-we-collect" style={{ color: '#2563eb', textDecoration: 'none' }}>Information We Collect</a></li>
          <li><a href="#coppa" style={{ color: '#2563eb', textDecoration: 'none' }}>Children&apos;s Privacy (COPPA)</a></li>
          <li><a href="#how-we-use" style={{ color: '#2563eb', textDecoration: 'none' }}>How We Use Your Information</a></li>
          <li><a href="#scout-data-limitation" style={{ color: '#2563eb', textDecoration: 'none' }}>Scout Data Usage Limitation</a></li>
          <li><a href="#information-sharing" style={{ color: '#2563eb', textDecoration: 'none' }}>Information Sharing</a></li>
          <li><a href="#data-security" style={{ color: '#2563eb', textDecoration: 'none' }}>Data Security</a></li>
          <li><a href="#your-rights" style={{ color: '#2563eb', textDecoration: 'none' }}>Your Rights (GDPR/CCPA)</a></li>
          <li><a href="#ccpa" style={{ color: '#2563eb', textDecoration: 'none' }}>California Residents (CCPA/CPRA)</a></li>
          <li><a href="#data-retention" style={{ color: '#2563eb', textDecoration: 'none' }}>Data Retention</a></li>
          <li><a href="#third-party" style={{ color: '#2563eb', textDecoration: 'none' }}>Third-Party Services</a></li>
          <li><a href="#location" style={{ color: '#2563eb', textDecoration: 'none' }}>Location Services</a></li>
          <li><a href="#push-notifications" style={{ color: '#2563eb', textDecoration: 'none' }}>Push Notifications</a></li>
          <li><a href="#international" style={{ color: '#2563eb', textDecoration: 'none' }}>International Users</a></li>
          <li><a href="#limitation-liability" style={{ color: '#2563eb', textDecoration: 'none' }}>Limitation of Liability</a></li>
          <li><a href="#dispute-resolution" style={{ color: '#2563eb', textDecoration: 'none' }}>Dispute Resolution</a></li>
          <li><a href="#indemnification" style={{ color: '#2563eb', textDecoration: 'none' }}>Indemnification</a></li>
          <li><a href="#changes" style={{ color: '#2563eb', textDecoration: 'none' }}>Changes to This Policy</a></li>
          <li><a href="#contact" style={{ color: '#2563eb', textDecoration: 'none' }}>Contact Us</a></li>
        </ol>
      </nav>

      {/* 1. Introduction */}
      <section id="introduction" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          1. Introduction
        </h2>
        <p style={{ marginBottom: '12px' }}>
          Swipe Savvy, LLC (&quot;Swipe Savvy,&quot; &quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates
          the Camp Card platform (&quot;Camp Card,&quot; &quot;Platform,&quot; or &quot;Service&quot;), a digital fundraising
          solution designed to support Scouting America councils, troops, and individual
          Scouts. Camp Card is available through our mobile application (iOS and Android), our web-based
          administrative portal, and our website at{' '}
          <a href="https://www.campcardapp.org" style={{ color: '#2563eb' }}>https://www.campcardapp.org</a>.
        </p>
        <p style={{ marginBottom: '12px' }}>
          This Privacy Policy (&quot;Policy&quot;) explains how we collect, use, disclose, store, and
          safeguard your personal information when you access or use any part of the Camp Card Platform.
          This Policy applies to all users of the Platform, including but not limited to:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Scouts</strong> (including minors under 13 and minors under 18)</li>
          <li><strong>Parents and legal guardians</strong> of Scouts</li>
          <li><strong>Troop Leaders</strong> (also referred to as Unit Leaders or Scoutmasters)</li>
          <li><strong>Council Administrators</strong></li>
          <li><strong>National Administrators</strong></li>
          <li><strong>Merchants and business partners</strong> participating in the Camp Card program</li>
        </ul>
        <p style={{ marginBottom: '12px' }}>
          By accessing or using the Camp Card Platform, you acknowledge that you have read, understood,
          and agree to be bound by this Privacy Policy. If you do not agree with any part of this Policy,
          you must discontinue use of the Platform immediately.
        </p>
        <p>
          We are committed to protecting the privacy and security of all users, with particular attention
          to the privacy of children and minors. We comply with all applicable federal and state privacy
          laws, including the Children&apos;s Online Privacy Protection Act (&quot;COPPA&quot;), the
          California Consumer Privacy Act (&quot;CCPA&quot;), the California Privacy Rights Act
          (&quot;CPRA&quot;), and the General Data Protection Regulation (&quot;GDPR&quot;) where applicable.
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section id="information-we-collect" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          2. Information We Collect
        </h2>

        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', marginTop: '24px', color: '#1f2937' }}>
          2.1 Information from Adults (Parents, Troop Leaders, Council Administrators, Merchants)
        </h3>
        <p style={{ marginBottom: '12px' }}>
          When adult users create an account or interact with the Platform, we may collect the following
          categories of personal information:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Identity Information:</strong> Full name (first and last), display name, and user role</li>
          <li><strong>Contact Information:</strong> Email address, phone number, and mailing address (for merchants)</li>
          <li><strong>Account Credentials:</strong> Username, password (stored using industry-standard BCrypt hashing with a cost factor of 12 — we never store plaintext passwords), and authentication tokens</li>
          <li><strong>Payment Information:</strong> Billing name, billing address, and payment card details. All payment data is processed securely through <strong>Authorize.net</strong>, our PCI DSS Level 1 compliant payment processor. We do not store full credit or debit card numbers, CVV codes, or complete card expiration dates on our servers. Card tokenization is handled entirely by Authorize.net Accept Hosted and Accept.js</li>
          <li><strong>Organizational Affiliation:</strong> Scouting America council association, troop or pack number, unit designation, and administrative role within the organization</li>
          <li><strong>Device and Usage Information:</strong> IP address, browser type and version, device type, operating system, access timestamps, pages viewed, and referring URLs</li>
          <li><strong>Communication Data:</strong> Support tickets, correspondence, feedback, and survey responses submitted to us</li>
        </ul>

        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', marginTop: '24px', color: '#1f2937' }}>
          2.2 Information from and about Scouts (Minors Under 18)
        </h3>
        <p style={{ marginBottom: '12px' }}>
          <strong>We practice strict data minimization for youth users.</strong> In accordance with COPPA
          and our commitment to children&apos;s privacy, we collect only the absolute minimum information
          necessary to operate the fundraising program. The following information may be collected for
          Scout accounts:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>First Name Only:</strong> We collect only the Scout&apos;s first name. No last name, surname, or full legal name is stored in Scout profiles</li>
          <li><strong>Date of Birth:</strong> Collected solely for age verification and COPPA compliance to determine whether the user is under 13, under 18, or an adult</li>
          <li><strong>Parent/Guardian Contact Information:</strong> Parent or guardian email address and, optionally, phone number for consent verification and communication</li>
          <li><strong>Referral Code:</strong> A unique, system-generated code used to track fundraising progress and attribute sales to the correct Scout</li>
          <li><strong>Troop/Pack Association:</strong> The Scout&apos;s troop or pack number and council affiliation for organizational reporting</li>
        </ul>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '16px 20px',
          marginTop: '16px',
        }}>
          <p style={{ fontWeight: '700', color: '#b91c1c', marginBottom: '8px', fontSize: '15px' }}>
            What We Do NOT Collect from Scouts:
          </p>
          <ul style={{ paddingLeft: '24px', margin: 0, color: '#991b1b' }}>
            <li>Social Security numbers or government-issued identification numbers</li>
            <li>Home or mailing addresses</li>
            <li>Photographs, videos, or biometric data</li>
            <li>Browsing behavior, cookies for advertising, or tracking pixels</li>
            <li>School name or educational records</li>
            <li>Health or medical information</li>
            <li>Precise geolocation data (without explicit parental consent)</li>
            <li>Any sensitive personal information not directly related to fundraising</li>
          </ul>
        </div>
      </section>

      {/* 3. Children's Privacy (COPPA) */}
      <section id="coppa" style={{
        marginBottom: '40px',
        backgroundColor: '#fef9e7',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '28px',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#92400e' }}>
          3. Children&apos;s Privacy (COPPA Compliance)
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Swipe Savvy, LLC is firmly committed to complying with the Children&apos;s Online Privacy
          Protection Act (COPPA), 15 U.S.C. &sect; 6501&ndash;6506, and its implementing regulations at
          16 C.F.R. Part 312. Because Camp Card serves Scouting America youth members, many of whom
          are under the age of 13, we take extensive precautions to protect the privacy, safety, and
          well-being of child users.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', marginTop: '20px', color: '#92400e' }}>
          3.1 Parental Consent Required
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Before any Scout under the age of 18 can fully access the Camp Card mobile application or have
          their personal information collected beyond what is strictly necessary for internal operations,
          we require verifiable parental or guardian consent. Our consent process works as follows:
        </p>
        <ol style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Account Creation by an Authorized Adult:</strong> A Troop Leader or Council Administrator
            creates the Scout account through the Camp Card administrative portal, providing the Scout&apos;s
            first name, date of birth, and a parent/guardian email address.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Consent Request Email:</strong> An automated consent request email is sent to the
            parent/guardian at the email address provided. This email clearly describes the information
            to be collected, the purposes for which it will be used, and the parent&apos;s rights.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Parent Review and Decision:</strong> The parent or guardian must review the detailed
            privacy disclosure and explicitly grant or deny consent through a secure, authenticated link.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Consent Confirmation:</strong> Only upon affirmative parental consent does the Scout&apos;s
            account become fully activated. Without parental consent, the Scout account remains in a
            restricted, non-functional state and no additional personal information is collected.
          </li>
        </ol>

        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', marginTop: '20px', color: '#92400e' }}>
          3.2 Location Access Consent for Minors
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Certain features of the Camp Card mobile application, such as finding nearby merchant offers,
          may utilize device location data. For all minor users (under 18), location-based features
          require separate, explicit parental consent. Parents and guardians can:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Grant or deny location access during the initial consent process</li>
          <li>Enable or disable location access at any time through the parent dashboard in the app or by contacting us directly</li>
          <li>Revoke location consent independently without affecting the Scout&apos;s ability to use other, non-location-based features of the Platform</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', marginTop: '20px', color: '#92400e' }}>
          3.3 Parental Rights Under COPPA
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Parents and legal guardians of minor users have the following rights at all times:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Right to Review:</strong> Request and review all personal information collected about their child</li>
          <li><strong>Right to Delete:</strong> Request the immediate deletion of their child&apos;s personal information from our systems</li>
          <li><strong>Right to Refuse:</strong> Refuse further collection, use, or maintenance of their child&apos;s information</li>
          <li><strong>Right to Revoke Consent:</strong> Revoke previously granted consent at any time, which will result in the deactivation of the Scout&apos;s account and deletion of their data</li>
        </ul>
        <p>
          To exercise any of these rights, parents and guardians may contact us at{' '}
          <a href="mailto:parents@swipesavvy.com" style={{ color: '#2563eb', fontWeight: '600' }}>parents@swipesavvy.com</a>{' '}
          or{' '}
          <a href="mailto:privacy@swipesavvy.com" style={{ color: '#2563eb', fontWeight: '600' }}>privacy@swipesavvy.com</a>.
          We will respond to all parental requests within 48 hours and fulfill data deletion requests
          within 30 calendar days.
        </p>
      </section>

      {/* 4. How We Use Your Information */}
      <section id="how-we-use" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          4. How We Use Your Information
        </h2>
        <p style={{ marginBottom: '12px' }}>
          We use the personal information we collect for the following purposes, each of which is necessary
          to operate the Camp Card Platform and fulfill our obligations to users:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Platform Operations:</strong> To operate, maintain, and improve the Camp Card fundraising platform, including account creation, authentication, and access control</li>
          <li><strong>Fundraising Tracking and Attribution:</strong> To track and attribute subscription sales and fundraising activity to the correct Scout, troop, and council for reporting and recognition purposes</li>
          <li><strong>Payment Processing:</strong> To process payments securely through Authorize.net, including subscription purchases, merchant transactions, and refunds</li>
          <li><strong>Communications:</strong> To send transactional emails (account verification, password resets, consent requests, fundraising progress updates), push notifications, and important Platform announcements</li>
          <li><strong>Customer Support:</strong> To respond to inquiries, troubleshoot issues, and provide technical assistance</li>
          <li><strong>Service Improvement:</strong> To analyze usage patterns and feedback to improve Platform features, performance, and user experience</li>
          <li><strong>Safety and Security:</strong> To detect, prevent, and address fraud, unauthorized access, security incidents, and technical issues</li>
          <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, and governmental requests</li>
        </ul>
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '8px',
          padding: '16px 20px',
          marginTop: '16px',
        }}>
          <p style={{ fontWeight: '700', color: '#166534', margin: 0 }}>
            We do NOT use Scout data for behavioral advertising, profiling, targeted marketing, or any
            purpose unrelated to the Camp Card fundraising program.
          </p>
        </div>
      </section>

      {/* 5. Scout Data Usage Limitation */}
      <section id="scout-data-limitation" style={{
        marginBottom: '40px',
        backgroundColor: '#eff6ff',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        padding: '28px',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
          5. Scout Data Usage Limitation
        </h2>
        <p style={{ marginBottom: '16px', fontSize: '17px', lineHeight: '1.9' }}>
          Scout information &mdash; including first names, registration details, troop/unit affiliation,
          council association, referral codes, and fundraising activity data &mdash; is collected and used{' '}
          <strong>solely for the purposes of fundraising reporting and sales tracking</strong> within the
          Camp Card program.
        </p>
        <p style={{ marginBottom: '16px', fontSize: '17px', lineHeight: '1.9' }}>
          This data is <strong>never</strong> used for:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px', fontSize: '17px' }}>
          <li>Marketing or advertising of any kind</li>
          <li>Behavioral profiling or analytics beyond fundraising metrics</li>
          <li>Sale, rental, or exchange with any third party for commercial purposes</li>
          <li>Training of machine learning models or artificial intelligence systems</li>
          <li>Any purpose unrelated to Camp Card fundraising operations</li>
        </ul>
        <p style={{ fontWeight: '700', color: '#1e40af', fontSize: '15px' }}>
          This restriction applies regardless of whether the Scout is currently active in the program or
          has since departed. It applies to all data collected during the Scout&apos;s participation and is
          enforceable for the full duration of data retention and beyond.
        </p>
      </section>

      {/* 6. Information Sharing */}
      <section id="information-sharing" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          6. Information Sharing
        </h2>
        <p style={{ marginBottom: '16px' }}>
          We do not sell, rent, or trade your personal information. We may share information only in the
          following limited circumstances, each of which is necessary for the operation of the Platform:
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          6.1 Scouting America Councils and Troops
        </h3>
        <p style={{ marginBottom: '16px' }}>
          Scout fundraising progress data (sales counts, referral activity, and attribution data) is shared
          with authorized Troop Leaders and Council Administrators within the Scout&apos;s organizational
          hierarchy. This sharing is limited strictly to <strong>fundraising reporting and sales tracking
          purposes</strong>. Troop Leaders can view only the Scouts within their assigned troop, and Council
          Administrators can view only troops within their council.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          6.2 Payment Processors
        </h3>
        <p style={{ marginBottom: '16px' }}>
          Payment card data is transmitted directly to <strong>Authorize.net</strong>, our PCI DSS Level 1
          compliant payment processor, using their Accept Hosted and Accept.js tokenization services. Card
          data never passes through or is stored on Camp Card servers. Authorize.net processes payments in
          accordance with their own privacy policy and the Payment Card Industry Data Security Standard (PCI DSS).
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          6.3 Service Providers
        </h3>
        <p style={{ marginBottom: '16px' }}>
          We engage a limited number of trusted third-party service providers to assist in operating the
          Platform. These providers include email delivery services (Amazon SES), cloud hosting and
          infrastructure (Amazon Web Services), analytics tools, and push notification services (Firebase
          Cloud Messaging). All service providers are bound by data processing agreements (&quot;DPAs&quot;)
          that restrict their use of personal information to only those purposes necessary to provide
          services to us and require them to maintain appropriate security safeguards.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          6.4 Legal Requirements
        </h3>
        <p style={{ marginBottom: '16px' }}>
          We may disclose personal information when we believe in good faith that disclosure is necessary to:
          (a) comply with applicable law, regulation, legal process, or governmental request; (b) enforce our
          Terms of Service or other agreements; (c) protect the rights, property, or safety of Swipe Savvy,
          our users, or the public; or (d) detect, prevent, or address fraud, security, or technical issues.
        </p>

        <div style={{
          backgroundColor: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '8px',
          padding: '16px 20px',
          marginTop: '20px',
        }}>
          <p style={{ fontWeight: '700', color: '#166534', margin: 0, fontSize: '17px' }}>
            We NEVER sell, rent, lease, or trade your personal information to third parties for their
            marketing or commercial purposes. This commitment applies to all user data, including Scout
            data, without exception.
          </p>
        </div>
      </section>

      {/* 7. Data Security */}
      <section id="data-security" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          7. Data Security
        </h2>
        <p style={{ marginBottom: '16px' }}>
          We implement comprehensive, industry-standard technical and organizational security measures to
          protect personal information against unauthorized access, alteration, disclosure, or destruction.
          Our security practices include:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Encryption in Transit:</strong> All data transmitted between users and the Platform is encrypted using TLS 1.3 (Transport Layer Security). All API communications are conducted over HTTPS</li>
          <li><strong>Encryption at Rest:</strong> Sensitive data stored in our databases is encrypted using AES-256-GCM (Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode). Council-specific payment gateway credentials are individually encrypted at rest</li>
          <li><strong>Password Hashing:</strong> User passwords are hashed using the BCrypt algorithm with a cost factor of 12. Plaintext passwords are never stored or logged</li>
          <li><strong>PCI DSS Compliance:</strong> All payment card data is processed exclusively through Authorize.net, a PCI DSS Level 1 certified payment processor. Card data is tokenized before transmission and never touches Camp Card servers</li>
          <li><strong>Regular Security Assessments:</strong> We conduct periodic security audits, vulnerability assessments, and code reviews to identify and remediate potential security issues</li>
          <li><strong>Multi-Tenant Data Isolation:</strong> The Platform implements row-level security (RLS) policies and tenant context isolation to ensure that each Scouting America council&apos;s data is strictly separated and accessible only to authorized users within that council</li>
          <li><strong>Role-Based Access Controls (RBAC):</strong> Users are assigned roles (National Admin, Council Admin, Troop Leader, Parent, Scout) with the principle of least privilege, ensuring each user can access only the data and functions necessary for their role</li>
          <li><strong>Audit Logging:</strong> We maintain comprehensive audit logs of administrative actions, data access events, and security-relevant activities to support accountability and incident investigation</li>
          <li><strong>Infrastructure Security:</strong> Our Platform is hosted on Amazon Web Services (AWS) infrastructure, which maintains SOC 2, ISO 27001, and other industry certifications. Database access is restricted to application-level service accounts with minimal required privileges</li>
        </ul>
        <p>
          While we strive to protect your personal information using commercially reasonable safeguards,
          no method of electronic transmission or storage is 100% secure. In the event of a data breach
          that affects your personal information, we will notify affected users and applicable regulatory
          authorities in accordance with applicable law.
        </p>
      </section>

      {/* 8. Your Rights (GDPR/CCPA) */}
      <section id="your-rights" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          8. Your Rights (GDPR/CCPA)
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Depending on your jurisdiction and applicable law, you may have the following rights regarding
          your personal information:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong>Right of Access:</strong> You may request a copy of all personal data we hold about you.
            We will provide this information in a commonly used, machine-readable format within 30 days of
            your verified request.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Right to Correction (Rectification):</strong> You may request that we correct or update
            any inaccurate or incomplete personal data. You can also update most information directly through
            your account settings on the Platform.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Right to Deletion (Erasure):</strong> You may request that we delete your personal data.
            Upon verification of your request, we will delete your data within 30 days, except where we are
            required by law to retain certain records (e.g., financial transaction records for tax or audit purposes).
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Right to Data Portability:</strong> You may request to receive your personal data in a
            structured, commonly used, machine-readable format (e.g., JSON or CSV) for transfer to another
            service provider.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Right to Opt-Out:</strong> You may opt out of marketing communications at any time by
            clicking the &quot;unsubscribe&quot; link in any marketing email, adjusting your notification
            preferences in your account settings, or contacting us directly.
          </li>
        </ul>
        <p>
          To exercise any of these rights, email{' '}
          <a href="mailto:privacy@swipesavvy.com" style={{ color: '#2563eb', fontWeight: '600' }}>privacy@swipesavvy.com</a>{' '}
          with the subject line &quot;Privacy Rights Request&quot; or use the data management features
          available in your account settings. We may need to verify your identity before fulfilling your
          request. We will respond to all requests within 30 calendar days.
        </p>
      </section>

      {/* 9. California Residents (CCPA/CPRA) */}
      <section id="ccpa" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          9. California Residents (CCPA/CPRA)
        </h2>
        <p style={{ marginBottom: '16px' }}>
          If you are a California resident, you have additional rights under the California Consumer
          Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA). These rights are in
          addition to those described in Section 8 above.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          9.1 Right to Know
        </h3>
        <p style={{ marginBottom: '12px' }}>
          You have the right to request that we disclose the categories and specific pieces of personal
          information we have collected about you, the categories of sources from which the information
          was collected, the business or commercial purposes for collection, and the categories of third
          parties with whom we share personal information. You may make this request up to twice in any
          12-month period.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          9.2 Right to Delete
        </h3>
        <p style={{ marginBottom: '12px' }}>
          You have the right to request the deletion of personal information we have collected from you,
          subject to certain exceptions under the CCPA (such as information needed to complete a
          transaction, detect security incidents, or comply with legal obligations).
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          9.3 Right to Non-Discrimination
        </h3>
        <p style={{ marginBottom: '12px' }}>
          We will not discriminate against you for exercising any of your CCPA/CPRA rights. We will not
          deny you goods or services, charge you different prices, provide a different level of service
          quality, or suggest that you may receive different treatment as a result of exercising your
          privacy rights.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          9.4 No Sale of Personal Information
        </h3>
        <p style={{ marginBottom: '12px' }}>
          <strong>We do not sell personal information as defined under the CCPA/CPRA.</strong> We have not
          sold personal information in the preceding 12 months and have no plans to do so. We also do not
          &quot;share&quot; personal information for cross-context behavioral advertising purposes as
          defined under the CPRA.
        </p>

        <p style={{ marginTop: '16px' }}>
          To submit a CCPA/CPRA request, California residents may contact us at{' '}
          <a href="mailto:ccpa@swipesavvy.com" style={{ color: '#2563eb', fontWeight: '600' }}>ccpa@swipesavvy.com</a>{' '}
          or{' '}
          <a href="mailto:privacy@swipesavvy.com" style={{ color: '#2563eb', fontWeight: '600' }}>privacy@swipesavvy.com</a>.
          You may also designate an authorized agent to make a request on your behalf, provided the agent
          has your written permission and can verify their identity.
        </p>
      </section>

      {/* 10. Data Retention */}
      <section id="data-retention" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          10. Data Retention
        </h2>
        <p style={{ marginBottom: '16px' }}>
          We retain personal information only for as long as reasonably necessary to fulfill the purposes
          described in this Policy, unless a longer retention period is required or permitted by law. Our
          specific retention periods are as follows:
        </p>

        <div style={{
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          marginBottom: '16px',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>Data Category</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>Retention Period</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>Scout Personal Data</td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>Duration of program participation + 1 year</td>
              </tr>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>Adult User Accounts</td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>Duration of account activity + 2 years after last login</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>Payment Transaction Records</td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>7 years (tax and legal compliance)</td>
              </tr>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>Fundraising Reports</td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>Duration of participation + 3 years</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>Support Correspondence</td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>3 years from resolution</td>
              </tr>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>Security and Audit Logs</td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>1 year</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 16px' }}>Consent Records (COPPA)</td>
                <td style={{ padding: '10px 16px' }}>Duration of account + 3 years</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ marginBottom: '12px' }}>
          <strong>Deletion Upon Request:</strong> Upon a verified deletion request from a user (or a parent
          on behalf of a Scout), we will delete the requested personal data within 30 calendar days, subject
          to the following exceptions where retention is required by law:
        </p>
        <ul style={{ paddingLeft: '24px' }}>
          <li>Financial transaction records required for tax reporting or audit purposes</li>
          <li>Records necessary to detect, prevent, or investigate security incidents or fraud</li>
          <li>Records required to comply with a legal obligation or court order</li>
          <li>COPPA consent records (retained as evidence of compliance)</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          When data is deleted, it is permanently removed from active systems and purged from backups within
          90 days of the deletion request.
        </p>
      </section>

      {/* 11. Third-Party Services */}
      <section id="third-party" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          11. Third-Party Services
        </h2>
        <p style={{ marginBottom: '16px' }}>
          The Camp Card Platform integrates with the following third-party services to provide its
          functionality. Each of these services has its own privacy policy governing the data they process:
        </p>

        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '12px' }}>
            <strong>Authorize.net (Visa/CyberSource):</strong> Payment processing and card tokenization.
            Authorize.net is PCI DSS Level 1 certified and processes payment card information on our behalf.
            No full card numbers are stored on Camp Card servers. See:{' '}
            <a href="https://www.authorize.net/about-us/privacy/" style={{ color: '#2563eb' }}>Authorize.net Privacy Policy</a>
          </li>
          <li style={{ marginBottom: '12px' }}>
            <strong>Firebase (Google):</strong> Push notification delivery via Firebase Cloud Messaging (FCM).
            Firebase receives device tokens to route notifications. See:{' '}
            <a href="https://firebase.google.com/support/privacy" style={{ color: '#2563eb' }}>Firebase Privacy Information</a>
          </li>
          <li style={{ marginBottom: '12px' }}>
            <strong>Amazon Web Services (AWS):</strong> Cloud hosting, database services (RDS), file storage
            (S3), email delivery (SES), and infrastructure. Data is processed and stored in AWS US regions.
            See:{' '}
            <a href="https://aws.amazon.com/privacy/" style={{ color: '#2563eb' }}>AWS Privacy Policy</a>
          </li>
          <li style={{ marginBottom: '12px' }}>
            <strong>Google Maps / Google Places:</strong> Location and mapping services for displaying nearby
            merchant offers. Location queries are transmitted to Google only when the user actively uses
            location-based features and has granted the required consent. See:{' '}
            <a href="https://policies.google.com/privacy" style={{ color: '#2563eb' }}>Google Privacy Policy</a>
          </li>
        </ul>
        <p>
          We carefully vet all third-party service providers and require them to maintain appropriate
          security and privacy safeguards through contractual data processing agreements. We do not authorize
          any third-party service provider to use personal information for their own purposes beyond
          providing the contracted services.
        </p>
      </section>

      {/* 12. Location Services */}
      <section id="location" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          12. Location Services
        </h2>
        <p style={{ marginBottom: '12px' }}>
          The Camp Card mobile application may request access to your device&apos;s location services to
          provide features such as finding nearby merchant offers and displaying location-relevant content.
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Voluntary and Optional:</strong> Location access is entirely optional. The Camp Card app functions without location access; location-based features will simply be unavailable</li>
          <li><strong>No Background Collection:</strong> We do not collect location data in the background. Location data is accessed only when you are actively using a location-based feature within the app (foreground only)</li>
          <li><strong>No Storage of Precise Location:</strong> We do not store your precise GPS coordinates on our servers. Location data is used transiently to query nearby offers and is not retained</li>
          <li><strong>Parental Consent for Minors:</strong> As described in Section 3.2, location access for users under 18 requires separate, explicit parental consent that can be revoked at any time</li>
          <li><strong>Device Controls:</strong> You can enable, disable, or revoke location permissions at any time through your device&apos;s operating system settings (iOS: Settings &gt; Privacy &gt; Location Services; Android: Settings &gt; Location)</li>
        </ul>
      </section>

      {/* 13. Push Notifications */}
      <section id="push-notifications" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          13. Push Notifications
        </h2>
        <p style={{ marginBottom: '12px' }}>
          The Camp Card mobile application may send push notifications to your device. These notifications
          are delivered via Firebase Cloud Messaging (FCM) and may include:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Transactional Notifications:</strong> Payment confirmations, subscription status updates, and account activity alerts</li>
          <li><strong>Fundraising Updates:</strong> Progress reports, sales milestones, and recognition notifications for Scouts and Troop Leaders</li>
          <li><strong>Administrative Notifications:</strong> Consent requests (for parents), troop management updates (for Troop Leaders), and system announcements</li>
          <li><strong>New Offers:</strong> Notifications about new merchant offers available in the Camp Card program (opt-in)</li>
        </ul>
        <p style={{ marginBottom: '12px' }}>
          <strong>Control and Opt-Out:</strong> You can manage your push notification preferences at any time through:
        </p>
        <ul style={{ paddingLeft: '24px' }}>
          <li>The notification settings page within the Camp Card app</li>
          <li>Your device&apos;s system notification settings</li>
          <li>Contacting us at <a href="mailto:support@swipesavvy.com" style={{ color: '#2563eb' }}>support@swipesavvy.com</a></li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          Disabling push notifications will not affect the delivery of essential transactional emails
          (such as password resets and consent requests), which are sent via email rather than push
          notifications.
        </p>
      </section>

      {/* 14. International Users */}
      <section id="international" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          14. International Users
        </h2>
        <p style={{ marginBottom: '12px' }}>
          The Camp Card Platform is operated by Swipe Savvy, LLC, a company organized under the laws
          of the State of Texas, United States. The Platform is designed and intended for use within the
          United States in connection with Scouting America programs.
        </p>
        <p style={{ marginBottom: '12px' }}>
          All personal information collected through the Platform is processed and stored on servers
          located in the United States (specifically, AWS US-East-2 region, Ohio). If you access the
          Platform from outside the United States, please be aware that your information will be
          transferred to, processed, and stored in the United States, where data protection laws may
          differ from those in your country of residence.
        </p>
        <p>
          By using the Platform, you consent to the transfer of your information to the United States
          and its processing in accordance with this Privacy Policy and applicable U.S. law. If you are
          located in the European Economic Area (EEA), United Kingdom, or another jurisdiction with data
          transfer restrictions, the legal basis for this transfer is your explicit consent and the
          necessity of the transfer for the performance of the services you have requested.
        </p>
      </section>

      {/* 15. Limitation of Liability */}
      <section id="limitation-liability" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          15. Limitation of Liability
        </h2>
        <p style={{ marginBottom: '12px' }}>
          THE CAMP CARD PLATFORM AND ALL ASSOCIATED SERVICES ARE PROVIDED ON AN &quot;AS IS&quot; AND
          &quot;AS AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
          INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p style={{ marginBottom: '12px' }}>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SWIPE SAVVY, LLC, ITS
          OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, OR LICENSORS BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
          PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM: (A) YOUR ACCESS TO
          OR USE OF (OR INABILITY TO ACCESS OR USE) THE PLATFORM; (B) ANY CONDUCT OR CONTENT OF ANY THIRD
          PARTY ON THE PLATFORM; (C) ANY CONTENT OBTAINED FROM THE PLATFORM; OR (D) UNAUTHORIZED ACCESS,
          USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
        </p>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE TOTAL LIABILITY OF SWIPE SAVVY, LLC
          FOR ALL CLAIMS RELATED TO THE PLATFORM SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID
          TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100.00 USD).
        </p>
      </section>

      {/* 16. Dispute Resolution */}
      <section id="dispute-resolution" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          16. Dispute Resolution
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          16.1 Informal Resolution
        </h3>
        <p style={{ marginBottom: '16px' }}>
          Before initiating any formal dispute resolution process, you agree to first contact us at{' '}
          <a href="mailto:legal@swipesavvy.com" style={{ color: '#2563eb' }}>legal@swipesavvy.com</a>{' '}
          and attempt to resolve the dispute informally. We will make a good-faith effort to resolve any
          dispute through informal negotiation within sixty (60) days of receiving your written notice.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          16.2 Binding Arbitration
        </h3>
        <p style={{ marginBottom: '16px' }}>
          If a dispute cannot be resolved informally, you and Swipe Savvy, LLC agree that any dispute,
          claim, or controversy arising out of or relating to this Privacy Policy, the Platform, or the
          relationship between you and Swipe Savvy shall be resolved exclusively through final and binding
          arbitration administered by the American Arbitration Association (&quot;AAA&quot;) under its
          Consumer Arbitration Rules then in effect. The arbitration shall be conducted by a single
          arbitrator, in the English language, and in the State of Texas. The arbitrator&apos;s decision
          shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          16.3 Class Action Waiver
        </h3>
        <p style={{ marginBottom: '16px' }}>
          YOU AND SWIPE SAVVY, LLC AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR
          ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS,
          CONSOLIDATED, OR REPRESENTATIVE ACTION OR PROCEEDING. Unless both you and Swipe Savvy agree
          otherwise in writing, the arbitrator may not consolidate more than one person&apos;s claims and
          may not preside over any form of class or representative proceeding.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>
          16.4 Governing Law
        </h3>
        <p>
          This Privacy Policy and any disputes arising hereunder shall be governed by and construed in
          accordance with the laws of the <strong>State of Texas</strong>, United States, without regard
          to its conflict of law provisions. To the extent that arbitration is inapplicable or
          unenforceable, you agree that any litigation shall be filed exclusively in the state or federal
          courts located in the State of Texas, and you consent to the personal jurisdiction of such courts.
        </p>
      </section>

      {/* 17. Indemnification */}
      <section id="indemnification" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          17. Indemnification
        </h2>
        <p style={{ marginBottom: '12px' }}>
          You agree to indemnify, defend, and hold harmless Swipe Savvy, LLC and its officers, directors,
          employees, agents, affiliates, successors, and assigns from and against any and all claims,
          liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees)
          arising out of or relating to:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Your use of or access to the Camp Card Platform</li>
          <li>Your violation of this Privacy Policy or our Terms of Service</li>
          <li>Your violation of any applicable law, rule, or regulation</li>
          <li>Your violation of any third party&apos;s rights, including intellectual property or privacy rights</li>
          <li>Any content or information you submit, post, or transmit through the Platform</li>
        </ul>
        <p>
          This indemnification obligation shall survive the termination of your account and your use of
          the Platform.
        </p>
      </section>

      {/* 18. Changes to This Policy */}
      <section id="changes" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          18. Changes to This Policy
        </h2>
        <p style={{ marginBottom: '12px' }}>
          We may update this Privacy Policy from time to time to reflect changes in our practices,
          technology, legal requirements, or other factors. When we make changes:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Material Changes:</strong> For significant changes that affect how we collect, use, or share personal information, we will provide prominent notice via email to the address associated with your account and/or through an in-app notification at least 30 days before the changes take effect</li>
          <li><strong>Minor Changes:</strong> For non-material changes (such as typographical corrections or clarifications), we will update the &quot;Last Updated&quot; date at the top of this page</li>
          <li><strong>COPPA-Related Changes:</strong> Any changes affecting how we collect or use Scout (minor) data will require renewed parental consent before taking effect</li>
        </ul>
        <p style={{ marginBottom: '12px' }}>
          Your continued use of the Camp Card Platform following the posting of changes constitutes your
          acceptance of such changes. If you do not agree with any changes to this Policy, you must stop
          using the Platform and may request deletion of your account and personal data.
        </p>
        <p>
          We encourage you to review this Privacy Policy periodically to stay informed about how we
          protect your information. The current version of this Policy is always available at{' '}
          <a href="https://www.campcardapp.org/privacy" style={{ color: '#2563eb' }}>https://www.campcardapp.org/privacy</a>.
        </p>
      </section>

      {/* 19. Contact Us */}
      <section id="contact" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
          19. Contact Us
        </h2>
        <p style={{ marginBottom: '16px' }}>
          If you have any questions, concerns, or requests regarding this Privacy Policy, our data
          practices, or your personal information, please contact us using any of the following methods:
        </p>

        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '16px',
        }}>
          <p style={{ fontWeight: '700', fontSize: '17px', marginBottom: '16px' }}>Swipe Savvy, LLC</p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Email Contacts:</p>
            <ul style={{ paddingLeft: '24px', margin: 0 }}>
              <li>
                General Support:{' '}
                <a href="mailto:support@swipesavvy.com" style={{ color: '#2563eb' }}>support@swipesavvy.com</a>
              </li>
              <li>
                Privacy Inquiries:{' '}
                <a href="mailto:privacy@swipesavvy.com" style={{ color: '#2563eb' }}>privacy@swipesavvy.com</a>
              </li>
              <li>
                Legal Matters:{' '}
                <a href="mailto:legal@swipesavvy.com" style={{ color: '#2563eb' }}>legal@swipesavvy.com</a>
              </li>
              <li>
                Parent/Guardian Requests (COPPA):{' '}
                <a href="mailto:parents@swipesavvy.com" style={{ color: '#2563eb' }}>parents@swipesavvy.com</a>
              </li>
              <li>
                California Privacy Rights (CCPA/CPRA):{' '}
                <a href="mailto:ccpa@swipesavvy.com" style={{ color: '#2563eb' }}>ccpa@swipesavvy.com</a>
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Website:</p>
            <p style={{ margin: 0 }}>
              <a href="https://www.campcardapp.org" style={{ color: '#2563eb' }}>https://www.campcardapp.org</a>
            </p>
          </div>

          <div>
            <p style={{ fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Mailing Address:</p>
            <p style={{ margin: 0 }}>
              Swipe Savvy, LLC<br />
              Attn: Privacy Officer<br />
              250 N. Orange Ave. Suite 1250<br />
              Orlando, FL 32801<br />
              United States
            </p>
          </div>
        </div>

        <p>
          We aim to respond to all privacy-related inquiries within 48 hours and to fulfill data access
          or deletion requests within 30 calendar days of receipt and verification.
        </p>
      </section>

      {/* Footer */}
      <div style={{
        marginTop: '48px',
        paddingTop: '24px',
        borderTop: '2px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/terms" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>Terms of Service</Link>
          <Link href="/login" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>Back to Login</Link>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
          &copy; {new Date().getFullYear()} Swipe Savvy, LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
}
