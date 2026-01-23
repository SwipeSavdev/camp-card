# Camp Card Legal Documents

**Published by Swipe Savvy, LLC**

This directory contains the legal documents required for Apple App Store and Google Play Store submission.

## Documents

### Terms of Service (`TERMS_OF_SERVICE.md`)

Comprehensive terms covering:
- Service description and eligibility
- Account registration and security
- Subscription and payment terms
- User conduct and acceptable use
- Intellectual property rights
- Disclaimers and limitations of liability
- Dispute resolution and arbitration
- Apple/Google store-specific terms

### Privacy Policy (`PRIVACY_POLICY.md`)

Comprehensive privacy policy covering:
- Data collection practices
- Data usage and purposes
- Information sharing and disclosure
- Data security measures
- Data retention policies
- User privacy rights
- COPPA compliance (children's privacy)
- CCPA compliance (California privacy)
- Third-party services
- Location and notification settings

## Compliance

These documents are designed to comply with:

| Regulation | Coverage |
|------------|----------|
| **COPPA** | Children's Online Privacy Protection Act |
| **CCPA** | California Consumer Privacy Act |
| **Apple App Store Guidelines** | Section 5.1 (Privacy) |
| **Google Play Policies** | User Data Policy |
| **PCI-DSS** | Payment Card Industry standards (via Authorize.net) |

## Required Actions Before Submission

### 1. Review and Customize

Before submitting to app stores, review these documents and:
- [ ] Update contact email addresses
- [ ] Add mailing address
- [ ] Verify BSA council information
- [ ] Add phone numbers where indicated
- [ ] Review and confirm all data practices match implementation

### 2. Host Documents Online

Both Apple and Google require publicly accessible URLs:

1. **Host on your website:**
   - `https://www.campcardapp.org/terms`
   - `https://www.campcardapp.org/privacy`

2. **Add URLs to app configuration:**
   - Update `app.json` with privacy policy URL
   - Add Terms of Service URL to App Store Connect/Google Play Console

### 3. App Store Connect Requirements

When submitting to Apple:
- Privacy Policy URL (required)
- App Privacy details (App Store nutrition label)
- Data collection disclosure in submission form

### 4. Google Play Console Requirements

When submitting to Google:
- Privacy Policy URL (required)
- Data Safety section completion
- Target audience and content ratings

## Email Addresses to Configure

Ensure these email addresses are set up and monitored:

| Email | Purpose |
|-------|---------|
| `support@campcardapp.org` | General user support |
| `legal@campcardapp.org` | Legal inquiries |
| `privacy@campcardapp.org` | Privacy questions |
| `parents@campcardapp.org` | Parental inquiries (COPPA) |
| `ccpa@campcardapp.org` | California privacy requests |
| `dpo@campcardapp.org` | Data Protection Officer |
| `gdpr@campcardapp.org` | GDPR inquiries (if expanding internationally) |

## Updating Documents

When updating these documents:

1. Update the "Last Updated" date
2. Document changes in a changelog
3. Notify existing users of material changes
4. Allow reasonable time before changes take effect
5. Update hosted versions on website

## Converting to HTML

These Markdown files can be converted to HTML for web hosting:

```bash
# Using pandoc (install: brew install pandoc)
pandoc TERMS_OF_SERVICE.md -o terms.html
pandoc PRIVACY_POLICY.md -o privacy.html

# Or use any Markdown to HTML converter
```

## Legal Review Recommendation

While these documents are comprehensive, we recommend having them reviewed by legal counsel before app store submission to ensure:
- Compliance with current laws
- Accuracy for Swipe Savvy's specific implementation
- State-specific requirements are met
- BSA organizational requirements are satisfied

---

**Swipe Savvy, LLC** - Publisher of Camp Card
