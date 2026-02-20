import SwiftUI

struct GiftCardView: View {
    let card: CampCard
    @Environment(\.dismiss) private var dismiss
    @State private var recipientEmail = ""
    @State private var giftMessage = ""
    @State private var isLoading = false
    @State private var success = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                if success {
                    Section {
                        VStack(spacing: 12) {
                            Image(systemName: "gift.fill").font(.largeTitle).foregroundColor(.green)
                            Text("Card gifted successfully!").fontWeight(.semibold)
                            Button("Done") { dismiss() }.buttonStyle(.borderedProminent).tint(CCColor.primary)
                        }
                        .frame(maxWidth: .infinity).padding()
                    }
                } else {
                    Section("Recipient") {
                        TextField("Email address", text: $recipientEmail)
                            .keyboardType(.emailAddress).autocorrectionDisabled().textInputAutocapitalization(.never)
                    }
                    Section("Message (optional)") {
                        TextField("Add a personal message...", text: $giftMessage, axis: .vertical)
                            .lineLimit(3, reservesSpace: true)
                    }
                    if let e = error {
                        Section { ErrorBanner(message: e) }
                    }
                    Section {
                        Button(action: sendGift) {
                            if isLoading { ProgressView().progressViewStyle(.circular) }
                            else { Text("Send Gift").fontWeight(.semibold).frame(maxWidth: .infinity) }
                        }
                        .disabled(recipientEmail.isEmpty || isLoading)
                        .listRowBackground(CCColor.primary)
                        .foregroundColor(.white)
                    }
                }
            }
            .navigationTitle("Gift Card").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .navigationBarLeading) { Button("Cancel") { dismiss() } } }
        }
    }

    private func sendGift() {
        isLoading = true; error = nil
        Task {
            do {
                let body = GiftCardRequest(recipientEmail: recipientEmail, giftMessage: giftMessage.isEmpty ? nil : giftMessage)
                let _: CampCard = try await APIClient.shared.request(.giftCard(id: card.id, body: body))
                success = true
            } catch { self.error = error.localizedDescription }
            isLoading = false
        }
    }
}
