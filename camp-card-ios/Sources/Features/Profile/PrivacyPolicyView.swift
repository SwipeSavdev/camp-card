import SwiftUI

// MARK: - PrivacyPolicyView
// Required by App Store Review Guideline 5.1.1.
// Links to the live hosted privacy policy and displays a local summary.

struct PrivacyPolicyView: View {
    private let privacyURL = URL(string: "https://www.campcardapp.org/privacy")!

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {

                // MARK: Header
                VStack(alignment: .leading, spacing: 8) {
                    Label("Privacy Policy", systemImage: "hand.raised.fill")
                        .font(.system(size: CCFont.xl, weight: .bold))
                        .foregroundColor(CCColor.primary)
                        .accessibilityAddTraits(.isHeader)

                    Text("Last updated: January 2026")
                        .font(.system(size: CCFont.sm))
                        .foregroundColor(CCColor.textSecondary)
                }

                // MARK: Summary
                PolicySection(title: "Information We Collect") {
                    Text("We collect information you provide directly, such as your name, email address, and account details. We also collect usage data to improve the app experience.")
                }

                PolicySection(title: "How We Use Your Information") {
                    Text("We use your information to operate the Camp Card platform, process transactions, send important service communications, and improve our services. We do not sell your personal information.")
                }

                PolicySection(title: "In-App Purchases") {
                    Text("Purchases are processed through the Apple App Store. We receive confirmation of purchase from Apple but do not receive or store your payment method details.")
                }

                PolicySection(title: "Data Sharing") {
                    Text("We share data only with service providers necessary to operate our platform (such as cloud hosting). We do not share personal data with advertisers or third-party marketing services.")
                }

                PolicySection(title: "Children's Privacy (COPPA)") {
                    Text("Scouts under the age of 13 require verifiable parental consent before using the app. Parents can review, modify, or delete their child's data by contacting support.")
                }

                PolicySection(title: "Your Rights") {
                    Text("You may request access to, correction of, or deletion of your personal data at any time. Contact us at privacy@campcardapp.org.")
                }

                PolicySection(title: "Contact Us") {
                    Text("BSA Camp Card\nprivacy@campcardapp.org\nhttps://www.campcardapp.org")
                }

                // MARK: Full Policy Link
                Link(destination: privacyURL) {
                    HStack {
                        Image(systemName: "safari")
                        Text("View Full Privacy Policy")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                }
                .buttonStyle(.borderedProminent)
                .tint(CCColor.primary)
                .accessibilityLabel("View full privacy policy at campcardapp.org")
            }
            .padding(20)
            .padding(.bottom, 40)
        }
        .navigationTitle("Privacy Policy")
        .navigationBarTitleDisplayMode(.inline)
        .ccScreenBackground()
    }
}

// MARK: - TermsOfServiceView

struct TermsOfServiceView: View {
    private let termsURL = URL(string: "https://www.campcardapp.org/terms")!

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {

                VStack(alignment: .leading, spacing: 8) {
                    Label("Terms of Service", systemImage: "doc.text.fill")
                        .font(.system(size: CCFont.xl, weight: .bold))
                        .foregroundColor(CCColor.primary)
                        .accessibilityAddTraits(.isHeader)

                    Text("Last updated: January 2026")
                        .font(.system(size: CCFont.sm))
                        .foregroundColor(CCColor.textSecondary)
                }

                PolicySection(title: "Acceptance of Terms") {
                    Text("By downloading or using Camp Card, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.")
                }

                PolicySection(title: "Use of the App") {
                    Text("Camp Card is designed exclusively for BSA fundraising activities. You agree to use the app only for lawful purposes and in accordance with BSA guidelines.")
                }

                PolicySection(title: "In-App Purchases") {
                    Text("Camp cards and subscriptions are purchased through the Apple App Store. All purchases are subject to Apple's payment terms. Subscriptions renew automatically unless cancelled at least 24 hours before the renewal date.")
                }

                PolicySection(title: "Subscriptions") {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("• Subscription period: Annual (12 months)")
                        Text("• Price: As displayed in the App Store at time of purchase")
                        Text("• Auto-renewal: Yes, unless cancelled")
                        Text("• Cancel anytime: Settings → [Your Name] → Subscriptions")
                    }
                    .font(.system(size: CCFont.sm))
                }

                PolicySection(title: "Refunds") {
                    Text("Refund requests are handled by Apple through the App Store. Camp Card does not process refunds directly. To request a refund, visit reportaproblem.apple.com.")
                }

                PolicySection(title: "Account Termination") {
                    Text("We reserve the right to suspend or terminate accounts that violate these terms or BSA guidelines. You may delete your account at any time from Settings.")
                }

                PolicySection(title: "Contact") {
                    Text("support@campcardapp.org\nhttps://www.campcardapp.org")
                }

                Link(destination: termsURL) {
                    HStack {
                        Image(systemName: "safari")
                        Text("View Full Terms of Service")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                }
                .buttonStyle(.borderedProminent)
                .tint(CCColor.primary)
                .accessibilityLabel("View full terms of service at campcardapp.org")
            }
            .padding(20)
            .padding(.bottom, 40)
        }
        .navigationTitle("Terms of Service")
        .navigationBarTitleDisplayMode(.inline)
        .ccScreenBackground()
    }
}

// MARK: - PolicySection helper

private struct PolicySection<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: CCFont.base, weight: .semibold))
                .accessibilityAddTraits(.isHeader)
            content()
                .font(.system(size: CCFont.sm))
                .foregroundColor(CCColor.text.opacity(0.85))
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(CCColor.card)
        .clipShape(RoundedRectangle(cornerRadius: CCRadius.md))
        .overlay(RoundedRectangle(cornerRadius: CCRadius.md).stroke(CCColor.border, lineWidth: 1))
    }
}
