import SwiftUI

/// Shown when a minor user's COPPA consent is PENDING, DENIED, or REVOKED.
/// Blocks the rest of the app until parent grants consent.
struct ConsentPendingView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @State private var consentStatus: ConsentStatusResponse?
    @State private var isLoading = false
    @State private var errorMessage: String?

    private let api = APIClient.shared

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 16) {
                Image(systemName: "person.badge.clock.fill")
                    .font(.system(size: 64))
                    .foregroundColor(Color(hex: "#003F87"))

                Text("Parental Consent Required")
                    .font(.title2)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)

                Text(bodyText)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)

                if let parentEmail = consentStatus?.parentEmail {
                    HStack {
                        Image(systemName: "envelope.fill")
                            .foregroundColor(Color(hex: "#003F87"))
                        Text("Sent to: \(parentEmail)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            if isLoading {
                ProgressView("Checking status…")
            } else {
                VStack(spacing: 12) {
                    Button("Check Status") { Task { await loadStatus() } }
                        .buttonStyle(.borderedProminent)
                        .tint(Color(hex: "#003F87"))

                    Button("Sign Out") { auth.logout() }
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }

            if let error = errorMessage {
                ErrorBanner(message: error)
                    .padding(.horizontal, 24)
            }

            Spacer()

            Text("If you believe this is an error, contact your troop leader or council administrator.")
                .font(.caption2)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
                .padding(.bottom, 32)
        }
        .task { await loadStatus() }
    }

    private var bodyText: String {
        switch auth.user?.consentStatus {
        case .pending:
            return "A consent request has been sent to your parent or guardian. The app will be available once they approve."
        case .denied:
            return "Your parent or guardian denied consent. Please ask them to reconsider or contact your troop leader."
        case .revoked:
            return "Parental consent was revoked. Please ask your parent or guardian to re-approve."
        default:
            return "Parental consent is required to use this app."
        }
    }

    private func loadStatus() async {
        isLoading = true
        errorMessage = nil
        do {
            consentStatus = try await api.request(.consentStatus)
            // Re-fetch user in case status changed
            await auth.initialize()
        } catch let ne as NetworkError {
            errorMessage = ne.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
