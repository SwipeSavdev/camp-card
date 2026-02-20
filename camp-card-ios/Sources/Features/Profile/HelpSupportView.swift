import SwiftUI

// MARK: - HelpSupportView
// Required by App Store reviewers — must be reachable within 2 taps of Profile.

struct HelpSupportView: View {
    @State private var showEmailCompose = false
    @State private var expandedFAQ: String? = nil

    private let supportEmail = "support@campcardapp.org"
    private let helpURL = URL(string: "https://www.campcardapp.org/help")!
    private let reportURL = URL(string: "https://reportaproblem.apple.com")!

    var body: some View {
        List {

            // MARK: Contact
            Section("Contact Us") {
                Button {
                    openEmail()
                } label: {
                    Label(supportEmail, systemImage: "envelope.fill")
                        .foregroundColor(.primary)
                }
                .accessibilityLabel("Email support at \(supportEmail)")

                Link(destination: helpURL) {
                    Label("Help Center", systemImage: "globe")
                        .foregroundColor(.primary)
                }
                .accessibilityLabel("Open help center website")
            }

            // MARK: Purchases
            Section("Purchases & Billing") {
                Link(destination: reportURL) {
                    Label("Report a Problem / Request Refund", systemImage: "exclamationmark.bubble")
                        .foregroundColor(.primary)
                }
                .accessibilityLabel("Request refund or report a problem through Apple")

                Button {
                    if let url = URL(string: "itms-apps://apps.apple.com/account/subscriptions") {
                        UIApplication.shared.open(url)
                    }
                } label: {
                    Label("Manage Subscription", systemImage: "creditcard")
                        .foregroundColor(.primary)
                }
                .accessibilityLabel("Manage subscription in App Store settings")
            }

            // MARK: FAQ
            Section("Frequently Asked Questions") {
                ForEach(faqItems, id: \.question) { item in
                    FAQRow(item: item, expandedQuestion: $expandedFAQ)
                }
            }

            // MARK: App info for reviewer context
            Section("About") {
                HStack {
                    Text("Version")
                    Spacer()
                    Text(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "—")
                        .foregroundColor(.secondary)
                }
                HStack {
                    Text("Platform")
                    Spacer()
                    Text("iOS")
                        .foregroundColor(.secondary)
                }
            }
        }
        .navigationTitle("Help & Support")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func openEmail() {
        let subject = "Camp Card Support".addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        if let url = URL(string: "mailto:\(supportEmail)?subject=\(subject)") {
            UIApplication.shared.open(url)
        }
    }

    private let faqItems: [FAQItem] = [
        FAQItem(
            question: "How do I use a camp card?",
            answer: "Show your QR code to a participating merchant. They will scan it to apply your discount. Each offer can be redeemed once per card."
        ),
        FAQItem(
            question: "Can I gift a card to someone?",
            answer: "Yes — tap 'Gift Card' in your Wallet, enter the recipient's email, and they will receive a claim link. Once claimed, the card transfers to their account."
        ),
        FAQItem(
            question: "How do I cancel my subscription?",
            answer: "Go to iOS Settings → tap your name → Subscriptions → Camp Card → Cancel Subscription. Cancel at least 24 hours before the renewal date to avoid being charged."
        ),
        FAQItem(
            question: "How do I restore my purchases?",
            answer: "Tap 'Restore Purchases' on the pricing screen or in Settings. Make sure you're signed in to the same Apple ID used for the original purchase."
        ),
        FAQItem(
            question: "Why does my scout need parental consent?",
            answer: "The Children's Online Privacy Protection Act (COPPA) requires parental consent for users under 13. A parent or guardian must approve the account before the scout can access the app."
        ),
        FAQItem(
            question: "My card isn't showing — what do I do?",
            answer: "Pull-to-refresh on the Wallet screen. If the issue persists, email support@campcardapp.org with your account email and order confirmation."
        )
    ]
}

// MARK: - FAQItem / FAQRow

private struct FAQItem {
    let question: String
    let answer: String
}

private struct FAQRow: View {
    let item: FAQItem
    @Binding var expandedQuestion: String?

    private var isExpanded: Bool { expandedQuestion == item.question }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    expandedQuestion = isExpanded ? nil : item.question
                }
            } label: {
                HStack {
                    Text(item.question)
                        .font(.system(size: CCFont.sm, weight: .medium))
                        .foregroundColor(.primary)
                        .multilineTextAlignment(.leading)
                    Spacer()
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .accessibilityHidden(true)
                }
            }
            .buttonStyle(.plain)
            .accessibilityLabel(item.question)
            .accessibilityHint(isExpanded ? "Tap to collapse" : "Tap to expand")

            if isExpanded {
                Text(item.answer)
                    .font(.system(size: CCFont.sm))
                    .foregroundColor(CCColor.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.top, 8)
            }
        }
        .padding(.vertical, 4)
    }
}
