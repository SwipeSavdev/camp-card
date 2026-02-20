import SwiftUI

struct RedemptionSuccessView: View {
    let message: String
    let detail: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 80))
                .foregroundColor(.green)
                .scaleEffect(1.0)
                .onAppear {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.5)) {}
                }

            VStack(spacing: 8) {
                Text(message)
                    .font(.title).fontWeight(.bold)
                Text(detail)
                    .font(.body).foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()

            Button("Done") { dismiss() }
                .buttonStyle(.borderedProminent)
                .tint(Color(hex: "#003F87"))
                .padding(.horizontal, 32)
                .padding(.bottom, 32)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(CCColor.card)
        .interactiveDismissDisabled()
    }
}
