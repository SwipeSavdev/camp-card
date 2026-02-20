import SwiftUI
import StoreKit

// MARK: - SubscriptionDisclosureView
// Required by App Store Connect before any subscription purchase is initiated.
// Shows price, billing period, auto-renewal notice, and legal links.

struct SubscriptionDisclosureView: View {

    let product: Product
    let onConfirm: () -> Void
    let onCancel: () -> Void

    private var priceString: String {
        product.displayPrice
    }

    private var periodString: String {
        guard let subscription = product.subscription else { return "year" }
        switch subscription.subscriptionPeriod.unit {
        case .day:   return subscription.subscriptionPeriod.value == 1 ? "day" : "\(subscription.subscriptionPeriod.value) days"
        case .week:  return subscription.subscriptionPeriod.value == 1 ? "week" : "\(subscription.subscriptionPeriod.value) weeks"
        case .month: return subscription.subscriptionPeriod.value == 1 ? "month" : "\(subscription.subscriptionPeriod.value) months"
        case .year:  return subscription.subscriptionPeriod.value == 1 ? "year" : "\(subscription.subscriptionPeriod.value) years"
        @unknown default: return "year"
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Handle bar
            Capsule()
                .fill(CCColor.border)
                .frame(width: 40, height: 4)
                .padding(.top, 12)

            ScrollView {
                VStack(spacing: 24) {
                    // Icon + title
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(CCColor.primary.opacity(0.12))
                                .frame(width: 72, height: 72)
                            Image(systemName: "star.circle.fill")
                                .font(.system(size: 36))
                                .foregroundColor(CCColor.primary)
                        }

                        Text("Subscribe to \(product.displayName)")
                            .font(.title2)
                            .fontWeight(.bold)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 24)

                    // Pricing card
                    VStack(spacing: 8) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(product.displayName)
                                    .font(.headline)
                                Text(product.description)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .lineLimit(2)
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 2) {
                                Text(priceString)
                                    .font(.title3)
                                    .fontWeight(.bold)
                                    .foregroundColor(CCColor.primary)
                                Text("per \(periodString)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(16)
                        .background(CCColor.surface)
                        .cornerRadius(12)
                    }

                    // Auto-renewal disclosure
                    VStack(alignment: .leading, spacing: 10) {
                        Label("Auto-Renewal Notice", systemImage: "arrow.clockwise.circle.fill")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(Color(hex: "#003F87"))

                        VStack(alignment: .leading, spacing: 6) {
                            disclosureBullet(
                                icon: "checkmark.circle",
                                text: "Your subscription auto-renews annually at \(priceString) unless cancelled at least 24 hours before the end of the current period."
                            )
                            disclosureBullet(
                                icon: "creditcard",
                                text: "Payment will be charged to your Apple ID account at confirmation of purchase."
                            )
                            disclosureBullet(
                                icon: "xmark.circle",
                                text: "You can cancel anytime in Settings > Apple ID > Subscriptions."
                            )
                            disclosureBullet(
                                icon: "arrow.triangle.2.circlepath",
                                text: "Account will be charged for renewal within 24 hours prior to the end of the current period."
                            )
                        }
                    }
                    .padding(16)
                    .background(Color(hex: "#003F87").opacity(0.06))
                    .cornerRadius(12)

                    // Legal links
                    HStack(spacing: 24) {
                        Link(destination: URL(string: "https://campcardapp.org/privacy")!) {
                            Label("Privacy Policy", systemImage: "lock.shield")
                                .font(.caption)
                                .foregroundColor(Color(hex: "#003F87"))
                        }
                        Link(destination: URL(string: "https://campcardapp.org/terms")!) {
                            Label("Terms of Service", systemImage: "doc.text")
                                .font(.caption)
                                .foregroundColor(Color(hex: "#003F87"))
                        }
                    }

                    // Action buttons
                    VStack(spacing: 12) {
                        Button(action: onConfirm) {
                            Text("Subscribe — \(priceString)/\(periodString)")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .background(CCColor.primary)
                                .cornerRadius(14)
                        }

                        Button(action: onCancel) {
                            Text("Cancel")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .frame(maxWidth: .infinity)
                                .frame(height: 44)
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
            }
        }
        .background(CCColor.card)
        .presentationDetents([.large])
        .presentationDragIndicator(.hidden)
    }

    private func disclosureBullet(icon: String, text: String) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(Color(hex: "#003F87"))
                .frame(width: 14, height: 14)
                .padding(.top, 1)
            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}
