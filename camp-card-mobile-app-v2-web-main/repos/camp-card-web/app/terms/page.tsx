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
      <p style={{ color: '#6b7280', marginBottom: '4px' }}>
        Effective Date: January 30, 2026
      </p>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Last Updated: January 30, 2026
      </p>

      {/* ======================================================
          SECTION 1 - ACCEPTANCE OF TERMS
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          1. Acceptance of Terms
        </h2>
        <p style={{ marginBottom: '12px' }}>
          Welcome to Camp Card. These Terms of Service (&quot;Terms,&quot; &quot;Agreement&quot;) constitute
          a legally binding agreement between you (&quot;User,&quot; &quot;you,&quot; &quot;your&quot;) and
          Swipe Savvy, LLC (&quot;Swipe Savvy,&quot; &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;), a Texas
          limited liability company, governing your access to and use of the Camp Card platform,
          including the Camp Card mobile application, web portal, website at{' '}
          <a href="https://www.campcardapp.org" style={{ color: '#2563eb' }}>
            https://www.campcardapp.org
          </a>, and all related services (collectively, the &quot;Service&quot;).
        </p>
        <p style={{ marginBottom: '12px' }}>
          Camp Card is developed and operated by Swipe Savvy, LLC in partnership with the
          Scouting America to support Scouting America council fundraising programs.
          References to &quot;Scouting America&quot; in these Terms are made solely
          in connection with describing the fundraising programs that the Service supports and
          do not imply that Scouting America is a party to this Agreement.
        </p>
        <p style={{ marginBottom: '12px' }}>
          By creating an account, downloading the mobile application, accessing the web portal,
          or otherwise using the Service in any manner, you acknowledge that you have read,
          understood, and agree to be bound by these Terms and our{' '}
          <Link href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</Link>, which
          is incorporated herein by reference. If you are using the Service on behalf of an
          organization (such as a Scouting America council, troop, or pack), you represent and warrant that
          you have the authority to bind that organization to these Terms.
        </p>
        <p>
          <strong>
            If you do not agree to all of these Terms, you must not access or use the Service.
          </strong>
        </p>
      </section>

      {/* ======================================================
          SECTION 2 - DESCRIPTION OF SERVICE
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          2. Description of Service
        </h2>
        <p style={{ marginBottom: '12px' }}>
          Camp Card is a digital fundraising platform designed to support Scouting America
          councils, troops, packs, and individual Scouts in their fundraising efforts. The
          Service digitizes the traditional Scouting America Camp Card program by providing a technology
          platform that connects Scouts, families, merchants, and Scouting America organizational units.
        </p>
        <p style={{ marginBottom: '12px' }}>
          The Service includes, but is not limited to, the following features:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            <strong>Discount Offers:</strong> Access to exclusive discounts and deals from
            participating local and national merchants
          </li>
          <li>
            <strong>QR Code Redemption:</strong> Digital QR codes that allow cardholders to
            redeem offers at participating merchant locations
          </li>
          <li>
            <strong>Merchant Discovery:</strong> Tools to find and browse participating
            merchants and their available offers
          </li>
          <li>
            <strong>Subscription Management:</strong> Management of Camp Card subscriptions
            including purchase, renewal, and account administration
          </li>
          <li>
            <strong>Scout Fundraising Support:</strong> Tracking and reporting tools for
            Scouts, troop leaders, and councils to monitor fundraising progress, manage sales
            data, and generate performance reports
          </li>
          <li>
            <strong>Gift Cards:</strong> The ability to purchase and send Camp Card
            subscriptions as gifts to support Scout fundraising
          </li>
          <li>
            <strong>Referral Program:</strong> Tools for Scouts and users to share referral
            links and earn credit toward fundraising goals
          </li>
        </ul>
        <p style={{ marginBottom: '12px' }}>
          The Service is available via mobile application (iOS and Android), a web-based
          administration portal, and the Camp Card website. Not all features may be available
          on all platforms or in all regions.
        </p>
        <p>
          <strong>Geographic Availability:</strong> The Service is currently available only
          within the United States of America and its territories. We make no representations
          that the Service is appropriate or available for use in other locations. Users who
          access the Service from outside the United States do so at their own risk and are
          responsible for compliance with local laws.
        </p>
      </section>

      {/* ======================================================
          SECTION 3 - AGE REQUIREMENTS AND PARENTAL CONSENT
          ====================================================== */}
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
          <li>Users must be at least 13 years of age to create an account on the Service</li>
          <li>
            Users under 18 years of age (&quot;Minors&quot;) require verifiable parental or
            legal guardian consent before accessing or using the Service
          </li>
          <li>
            Scout accounts are typically created and managed by Unit Leaders or parents, not
            directly by Scouts themselves
          </li>
          <li>
            Users under 13 years of age are not permitted to create accounts or use the
            Service independently under any circumstances
          </li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          3.2 COPPA Compliance
        </h3>
        <p style={{ marginBottom: '12px' }}>
          In compliance with the Children&apos;s Online Privacy Protection Act (COPPA) and
          applicable state privacy laws, we implement the following protections for users
          under 13 years of age:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            We do not knowingly collect personal information from children under 13 without
            verified parental consent
          </li>
          <li>
            Any data collected from minors is limited to what is reasonably necessary for
            participation in the Camp Card fundraising program
          </li>
          <li>
            We do not condition a child&apos;s participation on the disclosure of more
            personal information than is reasonably necessary
          </li>
          <li>
            We provide parents with the ability to review their child&apos;s personal
            information and request its deletion
          </li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          3.3 Parental Consent Flow
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Our parental consent process includes the following steps:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            A parent or legal guardian must provide verifiable consent before a Minor&apos;s
            account is activated
          </li>
          <li>
            Consent is obtained through our electronic consent verification process, which
            may include email verification, credit card verification, or other methods
            permitted under COPPA
          </li>
          <li>
            Parents receive a notification when a Scout account is created for their child and
            must approve the account before the Minor can access the Service
          </li>
          <li>
            Consent covers the collection, use, and disclosure of the Minor&apos;s personal
            information as described in our{' '}
            <Link href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</Link>
          </li>
          <li>
            Separate consent is required for location-based features and services
          </li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          3.4 Parent/Guardian Responsibilities
        </h3>
        <p style={{ marginBottom: '12px' }}>
          If you are the parent or legal guardian of a Minor using this Service, you
          acknowledge and agree that:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            You have the legal authority to consent on behalf of the Minor and to bind the
            Minor to these Terms
          </li>
          <li>
            You accept full responsibility for the Minor&apos;s use of the Service, including
            any activity conducted under the Minor&apos;s account
          </li>
          <li>
            You will supervise and monitor the Minor&apos;s activities on the platform
          </li>
          <li>
            You accept these Terms on behalf of the Minor
          </li>
          <li>
            You have the right to review, modify, or request deletion of your child&apos;s
            personal data at any time by contacting us at{' '}
            <a href="mailto:support@swipesavvy.com" style={{ color: '#2563eb' }}>
              support@swipesavvy.com
            </a>
          </li>
          <li>
            You may revoke consent for your child&apos;s use of the Service at any time,
            which will result in the deactivation of the Minor&apos;s account
          </li>
        </ul>
      </section>

      {/* ======================================================
          SECTION 4 - USER ACCOUNTS
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          4. User Accounts
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          4.1 Account Types
        </h3>
        <p style={{ marginBottom: '12px' }}>
          The Service supports the following account types, each with different permissions
          and access levels:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            <strong>Scout:</strong> Youth participants in the Scouting America Camp Card fundraising
            program. Scout accounts provide access to personal QR codes for affiliate
            tracking, view-only access to offers, referral link sharing, and fundraising
            progress tracking
          </li>
          <li>
            <strong>Parent:</strong> Parent or legal guardian of a Scout. Parent accounts
            allow browsing offers, viewing participating merchants, managing subscriptions,
            and overseeing a Scout&apos;s account activity
          </li>
          <li>
            <strong>Unit Leader:</strong> Scouting America troop, pack, or crew leaders who manage Scout
            accounts within their unit. Unit Leader accounts include troop management tools,
            Scout metrics and progress tracking, subscription management, and the ability to
            invite and manage Scouts
          </li>
          <li>
            <strong>Council Admin:</strong> Scouting America council-level administrators who oversee
            fundraising operations for their council, including managing merchants, offers,
            payment configurations, and viewing council-wide reporting data
          </li>
          <li>
            <strong>National Admin:</strong> Scouting America national organization administrators with
            full platform access, including system configuration, all council management, user
            administration, and platform-wide analytics
          </li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          4.2 Account Security
        </h3>
        <p style={{ marginBottom: '12px' }}>You are responsible for:</p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            Maintaining the confidentiality of your account credentials, including your
            password and any authentication tokens
          </li>
          <li>
            All activities that occur under your account, whether or not you have authorized
            such activities
          </li>
          <li>
            Notifying us immediately at{' '}
            <a href="mailto:support@swipesavvy.com" style={{ color: '#2563eb' }}>
              support@swipesavvy.com
            </a>{' '}
            if you become aware of any unauthorized use of your account or any other breach
            of security
          </li>
          <li>
            Ensuring that your account information is accurate, complete, and up to date
          </li>
          <li>
            Logging out of your account at the end of each session, particularly when using
            shared or public devices
          </li>
        </ul>
        <p>
          We reserve the right to disable any account at any time if, in our sole discretion,
          we believe you have violated any provision of these Terms, or if your account has
          been compromised.
        </p>
      </section>

      {/* ======================================================
          SECTION 5 - SUBSCRIPTIONS AND PAYMENTS
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          5. Subscriptions and Payments
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          5.1 Subscription Plans
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Camp Card offers various subscription plans with different benefits, pricing, and
          durations. Details of each plan, including the specific offers and merchants
          included, are available within the mobile application, on the website, and during
          the subscription purchase process. Subscription plans may vary by Scouting America council and
          geographic region.
        </p>
        <p>
          By purchasing a subscription, you agree to pay the applicable fees for the plan you
          select at the time of purchase. All subscription fees are stated in United States
          dollars (USD).
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          5.2 Payment Processing
        </h3>
        <p style={{ marginBottom: '12px' }}>
          All payments for Camp Card subscriptions and services are processed securely through
          Authorize.net, a Visa solution and leading payment gateway provider. By making a
          purchase through the Service, you acknowledge and agree to the following:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            Payment card information is tokenized and processed by Authorize.net using
            industry-standard encryption and PCI DSS-compliant security measures
          </li>
          <li>
            Swipe Savvy, LLC does not store your full credit card number, CVV, or other
            sensitive payment card data on its servers
          </li>
          <li>
            You authorize Swipe Savvy, LLC to charge the payment method you provide for the
            subscription fees and any applicable taxes
          </li>
          <li>
            Payment processing is subject to Authorize.net&apos;s terms and conditions, which
            are available at{' '}
            <a href="https://www.authorize.net" style={{ color: '#2563eb' }} target="_blank" rel="noopener noreferrer">
              https://www.authorize.net
            </a>
          </li>
          <li>
            Individual Scouting America councils may have their own Authorize.net payment configurations,
            meaning your payment may be processed through the council&apos;s designated
            payment gateway
          </li>
          <li>
            We accept major credit cards, debit cards, and other payment methods supported by
            Authorize.net
          </li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          5.3 Refund Policy
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Refund requests are evaluated based on the following policy:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            <strong>14-Day Refund Window:</strong> You may request a full refund within 14
            calendar days of your subscription purchase, provided that you have not redeemed
            any offers during that period
          </li>
          <li>
            <strong>No Refunds After Offer Redemption:</strong> Once you have redeemed any
            offer included in your subscription, the subscription is considered used and is
            no longer eligible for a refund
          </li>
          <li>
            <strong>Partial Refunds:</strong> Partial refunds are not available. Subscriptions
            are either fully refundable (within the 14-day window and with no redeemed offers)
            or non-refundable
          </li>
          <li>
            <strong>Processing Time:</strong> Approved refunds will be processed to the
            original payment method within 5-10 business days
          </li>
          <li>
            <strong>How to Request:</strong> To request a refund, contact{' '}
            <a href="mailto:support@swipesavvy.com" style={{ color: '#2563eb' }}>
              support@swipesavvy.com
            </a>{' '}
            with your account email and order information
          </li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          5.4 Auto-Renewal
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Certain subscription plans may include automatic renewal. If your subscription plan
          includes auto-renewal:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            Your subscription will automatically renew at the end of the current billing
            period unless you cancel before the renewal date
          </li>
          <li>
            You will be charged the then-current subscription fee at the time of renewal
          </li>
          <li>
            You will receive a reminder notification at least 7 days before your renewal date
          </li>
          <li>
            You may cancel auto-renewal at any time through your account settings or by
            contacting support
          </li>
          <li>
            Cancellation of auto-renewal will take effect at the end of the current billing
            period; you will continue to have access to your subscription benefits until that
            date
          </li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          5.5 Price Changes
        </h3>
        <p>
          We reserve the right to change subscription prices at any time. Any price changes
          will not affect your current subscription period. For auto-renewing subscriptions,
          we will notify you of price changes at least 30 days before the new price takes
          effect. If you do not agree to the new price, you may cancel your subscription
          before the renewal date. Continued use of the Service after a price change takes
          effect constitutes your acceptance of the new price.
        </p>
      </section>

      {/* ======================================================
          SECTION 6 - SCOUT DATA AND FUNDRAISING
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          6. Scout Data and Fundraising
        </h2>
        <p style={{ marginBottom: '12px' }}>
          Camp Card collects and processes certain information about Scouts in connection with
          the Scouting America fundraising program. We are committed to protecting Scout data and using it
          responsibly. By using the Service, you acknowledge and agree to the following:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            <strong>Purpose Limitation:</strong> Scout information, including names,
            fundraising progress, and sales data, is used solely for the purpose of
            fundraising reporting, sales tracking, and program administration within the Scouting America
            Camp Card program
          </li>
          <li>
            <strong>No Marketing or Profiling:</strong> Scout personal information is never
            used for marketing, advertising, behavioral profiling, or any purpose unrelated
            to the Camp Card fundraising program
          </li>
          <li>
            <strong>Data Shared with Scouting America Organizations:</strong> Scouting America councils and troops
            receive only aggregated reporting data and sales information necessary for
            administering their fundraising programs. This includes subscription counts,
            total sales amounts, and redemption statistics
          </li>
          <li>
            <strong>No Third-Party Data Sales:</strong> We do not sell, rent, or share Scout
            personal information with third parties for their own commercial purposes
          </li>
          <li>
            <strong>Data Minimization:</strong> We collect only the minimum Scout information
            necessary to operate the fundraising program, including name, associated unit,
            council affiliation, and fundraising activity data
          </li>
          <li>
            <strong>Parental Access:</strong> Parents and legal guardians may request access
            to, correction of, or deletion of their child&apos;s data at any time
          </li>
          <li>
            <strong>Data Retention:</strong> Scout data is retained only for as long as
            necessary to support active fundraising programs and comply with applicable legal
            requirements. Upon account deletion or program conclusion, Scout data will be
            removed or anonymized in accordance with our data retention policy
          </li>
        </ul>
      </section>

      {/* ======================================================
          SECTION 7 - ACCEPTABLE USE
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          7. Acceptable Use
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          7.1 Prohibited Activities
        </h3>
        <p style={{ marginBottom: '12px' }}>You agree NOT to:</p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Use the Service for any unlawful purpose or in violation of any applicable law or regulation</li>
          <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with any person or entity</li>
          <li>Attempt to gain unauthorized access to other users&apos; accounts, data, or any part of the Service infrastructure</li>
          <li>Interfere with or disrupt the proper operation of the Service, including its servers, networks, or databases</li>
          <li>Upload, transmit, or distribute any malicious code, viruses, worms, or other harmful software</li>
          <li>Collect, harvest, or scrape information about other users without their express consent</li>
          <li>Use the Service to harass, abuse, stalk, threaten, or otherwise harm any person</li>
          <li>Manipulate, falsify, or fabricate fundraising data, sales figures, or redemption records</li>
          <li>Share, transfer, or sell your account credentials or subscription access to unauthorized third parties</li>
          <li>Use automated systems (bots, scrapers, crawlers) to access the Service without our prior written consent</li>
          <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
          <li>Circumvent, disable, or otherwise interfere with any security-related features of the Service</li>
          <li>Use the Service to engage in any form of fraud, including payment fraud or identity theft</li>
          <li>Create multiple accounts to abuse promotions, referral programs, or offers</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          7.2 Offer Redemption Rules
        </h3>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Offers may only be redeemed by the registered account holder or the person whose QR code is presented</li>
          <li>Each offer is subject to the terms and conditions set by the participating merchant, including any limitations on frequency, quantity, or time of use</li>
          <li>Offers may not be combined with other promotions or discounts unless explicitly stated</li>
          <li>Merchants reserve the right to verify your subscription status before honoring an offer</li>
          <li>Screenshots, copies, or reproductions of QR codes are not valid for redemption</li>
          <li>Offers have no cash value and cannot be exchanged for cash or credit</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          7.3 Reporting Violations
        </h3>
        <p>
          If you become aware of any violation of these Terms, misuse of the Service, or
          suspicious activity, please report it immediately to{' '}
          <a href="mailto:support@swipesavvy.com" style={{ color: '#2563eb' }}>
            support@swipesavvy.com
          </a>. We investigate all reports and reserve the right to take appropriate action,
          including suspension or termination of accounts, at our sole discretion.
        </p>
      </section>

      {/* ======================================================
          SECTION 8 - INTELLECTUAL PROPERTY
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          8. Intellectual Property
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          8.1 Ownership
        </h3>
        <p style={{ marginBottom: '12px' }}>
          The Service and all of its original content, features, functionality, software,
          source code, databases, designs, graphics, logos, and documentation are and shall
          remain the exclusive property of Swipe Savvy, LLC and its licensors. The Service is
          protected by copyright, trademark, patent, trade secret, and other intellectual
          property laws of the United States and foreign countries.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          8.2 Limited License
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Subject to your compliance with these Terms, we grant you a limited, non-exclusive,
          non-transferable, non-sublicensable, revocable license to access and use the Service
          solely for your personal, non-commercial use in connection with the Scouting America Camp Card
          fundraising program. This license does not include the right to:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Modify, adapt, or create derivative works based on the Service</li>
          <li>Copy, distribute, or publicly display any content from the Service</li>
          <li>Use the Service or any content therein for any commercial purpose outside of the Camp Card program</li>
          <li>Remove, alter, or obscure any proprietary notices or labels on the Service</li>
          <li>Use any data mining, robots, or similar data gathering methods in connection with the Service</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          8.3 Scouting America Trademarks
        </h3>
        <p>
          &quot;Scouting America,&quot; the Scouting America logo, and related marks
          are trademarks or registered trademarks of Scouting America. These marks
          are used in the Service under license and for the sole purpose of identifying the
          Scouting America fundraising program. No right or license to use any Scouting America trademarks is granted
          to you by these Terms. &quot;Camp Card&quot; and &quot;Swipe Savvy&quot; are
          trademarks of Swipe Savvy, LLC.
        </p>
      </section>

      {/* ======================================================
          SECTION 9 - PRIVACY
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          9. Privacy
        </h2>
        <p style={{ marginBottom: '12px' }}>
          Your privacy is important to us. Our{' '}
          <Link href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</Link>{' '}
          describes in detail how we collect, use, store, share, and protect your personal
          information when you use the Service. The Privacy Policy is incorporated into and
          forms an integral part of these Terms by reference.
        </p>
        <p style={{ marginBottom: '12px' }}>
          By using the Service, you consent to the collection and use of your information as
          described in the Privacy Policy. Key topics covered in the Privacy Policy include:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Types of personal information collected</li>
          <li>How information is used and processed</li>
          <li>Data sharing practices and third-party disclosures</li>
          <li>Data security measures and encryption standards</li>
          <li>Your rights regarding your personal data</li>
          <li>Cookie and tracking technology usage</li>
          <li>Data retention and deletion policies</li>
          <li>Children&apos;s privacy protections</li>
        </ul>
        <p>
          We encourage you to review the Privacy Policy carefully before using the Service.
          If you do not agree with our privacy practices, you should not use the Service.
        </p>
      </section>

      {/* ======================================================
          SECTION 10 - THIRD-PARTY SERVICES
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          10. Third-Party Services
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          10.1 Participating Merchants
        </h3>
        <p style={{ marginBottom: '12px' }}>
          The Service facilitates access to offers and discounts provided by third-party
          merchants. We do not control, endorse, or assume responsibility for any
          merchant&apos;s products, services, business practices, or the content of their
          offers. Your interactions with merchants, including the redemption of offers,
          purchases, and any disputes, are solely between you and the merchant. Merchant
          offers are subject to each merchant&apos;s own terms and conditions, which may
          change without notice.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          10.2 Third-Party Links and Content
        </h3>
        <p style={{ marginBottom: '12px' }}>
          The Service may contain links to third-party websites, applications, or services
          that are not owned or controlled by Swipe Savvy, LLC. We have no control over, and
          assume no responsibility for, the content, privacy policies, or practices of any
          third-party websites or services. Accessing third-party links is at your own risk,
          and we encourage you to review the terms and privacy policies of any third-party
          services you visit.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          10.3 Payment Processing (Authorize.net)
        </h3>
        <p>
          Payment processing services are provided by Authorize.net, a Visa solution.
          Authorize.net processes your payment information in accordance with their own terms
          of service and privacy policy. We are not responsible for any errors, delays, or
          issues caused by Authorize.net&apos;s payment processing systems. By using the
          Service, you agree that Swipe Savvy, LLC is not liable for any payment processing
          failures, unauthorized charges, or other issues arising from Authorize.net&apos;s
          services, to the extent permitted by applicable law.
        </p>
      </section>

      {/* ======================================================
          SECTION 11 - DISCLAIMER OF WARRANTIES
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          11. Disclaimer of Warranties
        </h2>
        <p style={{ marginBottom: '12px', textTransform: 'uppercase', fontWeight: '600' }}>
          THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS
          WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE.
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, SWIPE SAVVY, LLC EXPRESSLY
          DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT
          </li>
          <li>
            WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE
            OF VIRUSES OR OTHER HARMFUL COMPONENTS
          </li>
          <li>
            WARRANTIES REGARDING THE ACCURACY, RELIABILITY, TIMELINESS, OR COMPLETENESS OF
            ANY CONTENT, INFORMATION, OR DATA PROVIDED THROUGH THE SERVICE
          </li>
          <li>
            WARRANTIES THAT THE SERVICE WILL MEET YOUR REQUIREMENTS OR EXPECTATIONS
          </li>
          <li>
            WARRANTIES REGARDING THE QUALITY, AVAILABILITY, OR VALIDITY OF ANY MERCHANT
            OFFERS OR DISCOUNTS
          </li>
        </ul>
        <p>
          NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED FROM SWIPE SAVVY, LLC
          OR THROUGH THE SERVICE SHALL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THESE
          TERMS. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO THE
          ABOVE EXCLUSIONS MAY NOT APPLY TO YOU. IN SUCH JURISDICTIONS, OUR WARRANTIES ARE
          LIMITED TO THE GREATEST EXTENT PERMITTED BY APPLICABLE LAW.
        </p>
      </section>

      {/* ======================================================
          SECTION 12 - LIMITATION OF LIABILITY
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          12. Limitation of Liability
        </h2>
        <p style={{ marginBottom: '12px', textTransform: 'uppercase', fontWeight: '600' }}>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SWIPE SAVVY,
          LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, SUPPLIERS, OR AFFILIATES
          BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
          INCLUDING WITHOUT LIMITATION:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>LOSS OF PROFITS, REVENUE, OR BUSINESS OPPORTUNITIES</li>
          <li>LOSS OF DATA OR DATA BREACH</li>
          <li>LOSS OF GOODWILL OR REPUTATION</li>
          <li>COST OF PROCUREMENT OF SUBSTITUTE SERVICES</li>
          <li>ANY OTHER INTANGIBLE LOSSES</li>
        </ul>
        <p style={{ marginBottom: '12px', textTransform: 'uppercase', fontWeight: '600' }}>
          ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE, WHETHER
          BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY
          OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p style={{ marginBottom: '12px', textTransform: 'uppercase', fontWeight: '600' }}>
          IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF
          OR RELATING TO THE SERVICE EXCEED THE GREATER OF (A) THE TOTAL AMOUNT YOU HAVE PAID
          TO US IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE
          CLAIM, OR (B) ONE HUNDRED UNITED STATES DOLLARS ($100.00).
        </p>
        <p>
          THE LIMITATIONS SET FORTH IN THIS SECTION SHALL APPLY EVEN IF THE REMEDIES PROVIDED
          HEREIN FAIL OF THEIR ESSENTIAL PURPOSE. SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION
          OR EXCLUSION OF LIABILITY FOR CERTAIN DAMAGES, SO SOME OR ALL OF THE ABOVE LIMITATIONS
          MAY NOT APPLY TO YOU.
        </p>
      </section>

      {/* ======================================================
          SECTION 13 - INDEMNIFICATION
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          13. Indemnification
        </h2>
        <p style={{ marginBottom: '12px' }}>
          You agree to defend, indemnify, and hold harmless Swipe Savvy, LLC, Scouting America, Scouting America local councils, their respective officers, directors, employees,
          agents, licensors, and suppliers (collectively, the &quot;Indemnified Parties&quot;)
          from and against any and all claims, damages, obligations, losses, liabilities,
          costs, expenses, and fees (including reasonable attorneys&apos; fees) arising from
          or relating to:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Your access to or use of the Service</li>
          <li>Your violation of any provision of these Terms</li>
          <li>Your violation of any third-party right, including any intellectual property, privacy, or proprietary right</li>
          <li>Your violation of any applicable law, rule, or regulation</li>
          <li>Any content or data you submit, post, or transmit through the Service</li>
          <li>Any dispute between you and a third party, including any merchant</li>
          <li>Any misrepresentation by you regarding your identity, age, authority, or affiliation</li>
        </ul>
        <p>
          This indemnification obligation will survive the termination of these Terms and your
          use of the Service. Swipe Savvy, LLC reserves the right, at its own expense, to
          assume the exclusive defense and control of any matter otherwise subject to
          indemnification by you, in which event you will cooperate with us in asserting any
          available defenses.
        </p>
      </section>

      {/* ======================================================
          SECTION 14 - TERMINATION
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          14. Termination
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          14.1 Termination by You
        </h3>
        <p style={{ marginBottom: '12px' }}>
          You may terminate your account and stop using the Service at any time by:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Deleting your account through the account settings in the mobile application or web portal</li>
          <li>Contacting us at{' '}
            <a href="mailto:support@swipesavvy.com" style={{ color: '#2563eb' }}>
              support@swipesavvy.com
            </a>{' '}
            to request account deletion
          </li>
        </ul>
        <p>
          Please note that terminating your account does not automatically entitle you to a
          refund of any subscription fees paid. Refund eligibility is governed by Section 5.3
          of these Terms.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          14.2 Termination by Us
        </h3>
        <p style={{ marginBottom: '12px' }}>
          We may suspend or terminate your account and access to the Service immediately,
          without prior notice or liability, for any reason, including but not limited to:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Violation of any provision of these Terms</li>
          <li>Engagement in fraudulent, abusive, or illegal activity</li>
          <li>Non-payment of subscription fees</li>
          <li>Request by law enforcement or government agencies</li>
          <li>Extended periods of account inactivity</li>
          <li>Discontinuation or material modification of the Service</li>
          <li>Technical or security issues</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          14.3 Effect of Termination
        </h3>
        <p style={{ marginBottom: '12px' }}>Upon termination of your account:</p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Your right to access and use the Service will immediately cease</li>
          <li>Any unused subscription benefits or unredeemed offers will be forfeited</li>
          <li>We may delete your account data in accordance with our data retention policy and applicable law</li>
          <li>Parents may request account deletion for their Minor children at any time</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          14.4 Survival
        </h3>
        <p>
          The following sections shall survive any termination of these Terms: Intellectual
          Property (Section 8), Disclaimer of Warranties (Section 11), Limitation of
          Liability (Section 12), Indemnification (Section 13), Dispute Resolution
          (Section 15), and General Provisions (Section 18), as well as any other provisions
          that by their nature should survive termination.
        </p>
      </section>

      {/* ======================================================
          SECTION 15 - DISPUTE RESOLUTION
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          15. Dispute Resolution
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          15.1 Informal Resolution
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Before initiating any formal dispute resolution proceeding, you agree to first
          attempt to resolve any dispute, claim, or controversy arising out of or relating to
          these Terms or the Service (&quot;Dispute&quot;) informally by contacting us at{' '}
          <a href="mailto:legal@swipesavvy.com" style={{ color: '#2563eb' }}>
            legal@swipesavvy.com
          </a>. We will attempt to resolve the Dispute informally within sixty (60) days. If
          the Dispute is not resolved within 60 days, either party may proceed with formal
          dispute resolution as described below.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          15.2 Binding Arbitration
        </h3>
        <p style={{ marginBottom: '12px' }}>
          If informal resolution is unsuccessful, any Dispute shall be resolved exclusively
          by binding arbitration administered by the American Arbitration Association
          (&quot;AAA&quot;) under its Consumer Arbitration Rules then in effect. The
          arbitration shall be conducted by a single arbitrator. The arbitration shall take
          place in the State of Texas, or at another mutually agreed location. The
          arbitrator&apos;s decision shall be final and binding and may be entered as a
          judgment in any court of competent jurisdiction.
        </p>
        <p>
          The arbitrator shall have the authority to award the same damages and relief that a
          court could award, subject to the limitations set forth in these Terms. Each party
          shall bear its own costs and attorneys&apos; fees, except as otherwise provided by
          law or the AAA rules.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          15.3 Class Action Waiver
        </h3>
        <p style={{ marginBottom: '12px', fontWeight: '600' }}>
          YOU AND SWIPE SAVVY, LLC AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY
          IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY
          PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. The arbitrator may not
          consolidate more than one person&apos;s claims and may not otherwise preside over
          any form of class or representative proceeding. If this class action waiver is found
          to be unenforceable, then the entirety of this arbitration provision shall be null
          and void.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          15.4 Small Claims Exception
        </h3>
        <p style={{ marginBottom: '12px' }}>
          Notwithstanding the foregoing, either party may bring an individual action in small
          claims court for Disputes within the jurisdictional limits of such court. This
          exception applies only if the claim qualifies for small claims court at the time of
          filing.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          15.5 Opt-Out Right
        </h3>
        <p style={{ marginBottom: '12px' }}>
          You have the right to opt out of the binding arbitration and class action waiver
          provisions of this Section 15 by sending written notice of your decision to opt out
          to{' '}
          <a href="mailto:legal@swipesavvy.com" style={{ color: '#2563eb' }}>
            legal@swipesavvy.com
          </a>{' '}
          within thirty (30) days of first accepting these Terms. Your notice must include
          your name, address, email address, and an unequivocal statement that you want to
          opt out of this arbitration agreement. If you opt out, all other provisions of these
          Terms will continue to apply.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          15.6 Governing Law
        </h3>
        <p>
          These Terms and any Dispute arising out of or related to these Terms or the Service
          shall be governed by and construed in accordance with the laws of the State of Texas,
          United States of America, without regard to its conflict of law provisions. To the
          extent that litigation is permitted under these Terms, the exclusive jurisdiction and
          venue for any legal action shall be the state and federal courts located in the State
          of Texas, and you consent to personal jurisdiction in such courts.
        </p>
      </section>

      {/* ======================================================
          SECTION 16 - ELECTRONIC COMMUNICATIONS
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          16. Electronic Communications
        </h2>
        <p style={{ marginBottom: '12px' }}>
          By creating an account or using the Service, you consent to receive electronic
          communications from us, including but not limited to:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Account-related emails (verification, password resets, security alerts)</li>
          <li>Subscription and payment confirmations</li>
          <li>Service announcements and updates</li>
          <li>Push notifications (if enabled on your device)</li>
          <li>Fundraising program updates and reports</li>
          <li>Legal notices and changes to these Terms or our Privacy Policy</li>
        </ul>
        <p style={{ marginBottom: '12px' }}>
          You agree that all agreements, notices, disclosures, and other communications we
          provide to you electronically satisfy any legal requirement that such communications
          be in writing.
        </p>
        <p>
          You may opt out of non-essential communications (such as marketing and promotional
          emails) by following the unsubscribe instructions provided in the communication or
          by adjusting your notification preferences in your account settings. However, you
          may not opt out of transactional or legal communications related to your account
          and use of the Service.
        </p>
      </section>

      {/* ======================================================
          SECTION 17 - CHANGES TO TERMS
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          17. Changes to Terms
        </h2>
        <p style={{ marginBottom: '12px' }}>
          We reserve the right to modify, amend, or update these Terms at any time at our sole
          discretion. When we make changes:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            We will update the &quot;Last Updated&quot; date at the top of these Terms
          </li>
          <li>
            For material changes, we will provide notice through the Service, by email to
            the address associated with your account, or by other reasonable means
          </li>
          <li>
            Material changes will become effective thirty (30) days after notice is provided,
            unless a longer period is required by applicable law
          </li>
          <li>
            Non-material changes (such as typographical corrections or formatting changes)
            may be made without prior notice
          </li>
        </ul>
        <p style={{ marginBottom: '12px' }}>
          Your continued use of the Service after the effective date of any changes constitutes
          your acceptance of the revised Terms. If you do not agree to the revised Terms, you
          must stop using the Service and, if applicable, cancel your subscription.
        </p>
        <p>
          We encourage you to periodically review these Terms to stay informed of any updates.
          Prior versions of these Terms may be obtained by contacting us at{' '}
          <a href="mailto:legal@swipesavvy.com" style={{ color: '#2563eb' }}>
            legal@swipesavvy.com
          </a>.
        </p>
      </section>

      {/* ======================================================
          SECTION 18 - GENERAL PROVISIONS
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          18. General Provisions
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          18.1 Entire Agreement
        </h3>
        <p style={{ marginBottom: '16px' }}>
          These Terms, together with the Privacy Policy and any other legal notices or
          agreements published by us on or through the Service, constitute the entire agreement
          between you and Swipe Savvy, LLC regarding your use of the Service. These Terms
          supersede any prior agreements, communications, or understandings between you and us,
          whether oral or written, regarding the Service.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          18.2 Severability
        </h3>
        <p style={{ marginBottom: '16px' }}>
          If any provision of these Terms is found to be invalid, illegal, or unenforceable by
          a court of competent jurisdiction, the remaining provisions shall continue in full
          force and effect. The invalid or unenforceable provision shall be modified to the
          minimum extent necessary to make it valid and enforceable while preserving the
          original intent of the parties, or if modification is not possible, it shall be
          severed from these Terms.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          18.3 Waiver
        </h3>
        <p style={{ marginBottom: '16px' }}>
          The failure of Swipe Savvy, LLC to exercise or enforce any right or provision of
          these Terms shall not constitute a waiver of such right or provision. Any waiver
          must be in writing and signed by an authorized representative of Swipe Savvy, LLC
          to be effective. A waiver of any provision on one occasion shall not be deemed a
          waiver of such provision on any subsequent occasion.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          18.4 Assignment
        </h3>
        <p style={{ marginBottom: '16px' }}>
          You may not assign or transfer these Terms, or any rights or obligations hereunder,
          without the prior written consent of Swipe Savvy, LLC. We may freely assign or
          transfer these Terms, including in connection with a merger, acquisition,
          restructuring, sale of assets, or by operation of law, without restriction and
          without notice to you.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '16px' }}>
          18.5 Force Majeure
        </h3>
        <p>
          Swipe Savvy, LLC shall not be liable for any delay or failure to perform any
          obligation under these Terms where the delay or failure results from any cause beyond
          our reasonable control, including but not limited to acts of God, natural disasters,
          pandemic or epidemic, war, terrorism, riots, embargoes, acts of civil or military
          authority, fire, floods, earthquakes, accidents, strikes, labor disputes, shortages
          of transportation, fuel, energy, labor, or materials, failure of telecommunications
          or information technology infrastructure, hacking, cyberattacks, changes in law or
          regulation, or any other event beyond our reasonable control.
        </p>
      </section>

      {/* ======================================================
          SECTION 19 - APPLE APP STORE TERMS
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          19. Apple App Store Terms
        </h2>
        <p style={{ marginBottom: '12px' }}>
          The following additional terms apply if you download or use the Camp Card mobile
          application from the Apple App Store:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            You acknowledge that these Terms are between you and Swipe Savvy, LLC only, and
            not with Apple Inc. (&quot;Apple&quot;). Swipe Savvy, LLC, not Apple, is solely
            responsible for the Camp Card application and its content
          </li>
          <li>
            Your use of the application must comply with the Apple App Store Terms of Service
          </li>
          <li>
            Swipe Savvy, LLC, not Apple, is responsible for providing any maintenance and
            support services for the application
          </li>
          <li>
            In the event of any failure of the application to conform to any applicable
            warranty, you may notify Apple and Apple will refund the purchase price (if any)
            for the application. To the maximum extent permitted by applicable law, Apple has
            no other warranty obligation with respect to the application
          </li>
          <li>
            Swipe Savvy, LLC, not Apple, is responsible for addressing any claims by you or
            any third party relating to the application, including but not limited to product
            liability claims, claims that the application fails to conform to any applicable
            legal or regulatory requirement, and claims arising under consumer protection,
            privacy, or similar legislation
          </li>
          <li>
            In the event of any third-party claim that the application or your possession and
            use of the application infringes a third party&apos;s intellectual property rights,
            Swipe Savvy, LLC, not Apple, will be solely responsible for the investigation,
            defense, settlement, and discharge of any such claim
          </li>
          <li>
            You represent and warrant that you are not located in a country subject to a U.S.
            government embargo or designated as a &quot;terrorist supporting&quot; country, and
            that you are not listed on any U.S. government list of prohibited or restricted
            parties
          </li>
          <li>
            Apple and its subsidiaries are third-party beneficiaries of these Terms, and upon
            your acceptance of these Terms, Apple will have the right (and will be deemed to
            have accepted the right) to enforce these Terms against you as a third-party
            beneficiary
          </li>
        </ul>
      </section>

      {/* ======================================================
          SECTION 20 - GOOGLE PLAY STORE TERMS
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          20. Google Play Store Terms
        </h2>
        <p style={{ marginBottom: '12px' }}>
          The following additional terms apply if you download or use the Camp Card mobile
          application from the Google Play Store:
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            You acknowledge that these Terms are between you and Swipe Savvy, LLC only, and
            not with Google LLC (&quot;Google&quot;). Swipe Savvy, LLC, not Google, is solely
            responsible for the Camp Card application and its content
          </li>
          <li>
            Your use of the application must comply with Google Play&apos;s Terms of Service
          </li>
          <li>
            Google is not responsible for providing any maintenance, support, or warranty
            services for the application
          </li>
          <li>
            Google is not responsible for addressing any claims by you or any third party
            relating to the application, including product liability claims, consumer
            protection claims, or intellectual property infringement claims
          </li>
          <li>
            In the event of any failure of the application, you should contact Swipe Savvy,
            LLC for support, not Google
          </li>
          <li>
            Google is a third-party beneficiary of these Terms, and upon your acceptance of
            these Terms, Google will have the right to enforce these Terms against you as a
            third-party beneficiary
          </li>
          <li>
            You are responsible for complying with all applicable Google Play Developer
            Program Policies when using the application
          </li>
        </ul>
      </section>

      {/* ======================================================
          SECTION 21 - CONTACT INFORMATION
          ====================================================== */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          21. Contact Information
        </h2>
        <p style={{ marginBottom: '12px' }}>
          If you have any questions, concerns, or feedback about these Terms of Service, the
          Service, or your account, please contact us using the following information:
        </p>
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>Swipe Savvy, LLC</strong>
          </p>
          <p style={{ marginBottom: '8px' }}>
            Website:{' '}
            <a href="https://www.campcardapp.org" style={{ color: '#2563eb' }}>
              https://www.campcardapp.org
            </a>
          </p>
          <p style={{ marginBottom: '8px' }}>
            General Support:{' '}
            <a href="mailto:support@swipesavvy.com" style={{ color: '#2563eb' }}>
              support@swipesavvy.com
            </a>
          </p>
          <p style={{ marginBottom: '8px' }}>
            Legal Inquiries:{' '}
            <a href="mailto:legal@swipesavvy.com" style={{ color: '#2563eb' }}>
              legal@swipesavvy.com
            </a>
          </p>
        </div>
        <p style={{ marginBottom: '12px' }}>
          For urgent security concerns or to report unauthorized access to your account,
          please email{' '}
          <a href="mailto:support@swipesavvy.com" style={{ color: '#2563eb' }}>
            support@swipesavvy.com
          </a>{' '}
          with the subject line &quot;URGENT: Security Concern.&quot;
        </p>
        <p>
          We will make reasonable efforts to respond to all inquiries within two (2) business
          days. Legal inquiries may require additional time to review and respond.
        </p>
      </section>

      {/* ======================================================
          FOOTER
          ====================================================== */}
      <div style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px',
      }}>
        <p style={{ marginBottom: '16px' }}>
          &copy; {new Date().getFullYear()} Swipe Savvy, LLC. All rights reserved.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
        }}>
          <Link href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</Link>
          <Link href="/login" style={{ color: '#2563eb' }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
