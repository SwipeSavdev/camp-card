import SwiftUI

struct InviteScoutView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var auth: AuthViewModel
    @State private var email = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var isLoading = false
    @State private var success = false
    @State private var error: String?

    private var troopId: Int { Int(auth.user?.troopId ?? "0") ?? 0 }

    var body: some View {
        NavigationStack {
            Form {
                Section("Scout Information") {
                    HStack {
                        CCTextField(label: "First Name", placeholder: "Alex", text: $firstName)
                        CCTextField(label: "Last Name", placeholder: "Smith", text: $lastName)
                    }
                    CCTextField(label: "Email", placeholder: "scout@example.com", text: $email, keyboardType: .emailAddress)
                }
                if let e = error { Section { ErrorBanner(message: e) } }
                if success {
                    Section { Label("Invitation sent!", systemImage: "checkmark.circle.fill").foregroundColor(.green) }
                }
                Section {
                    Button(action: sendInvite) {
                        if isLoading { ProgressView().progressViewStyle(.circular) }
                        else { Text("Send Invitation").frame(maxWidth: .infinity).fontWeight(.semibold) }
                    }
                    .disabled(isLoading || email.isEmpty || firstName.isEmpty || lastName.isEmpty)
                    .listRowBackground(Color(hex: "#003F87")).foregroundColor(.white)
                }
            }
            .navigationTitle("Invite Scout").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .navigationBarLeading) { Button("Cancel") { dismiss() } } }
        }
    }

    private func sendInvite() {
        isLoading = true; error = nil
        Task {
            do {
                let body = InviteScoutRequest(email: email, firstName: firstName, lastName: lastName, troopId: troopId)
                try await APIClient.shared.requestVoid(.inviteScout(body))
                success = true
                try? await Task.sleep(nanoseconds: 1_000_000_000)
                dismiss()
            } catch { self.error = error.localizedDescription }
            isLoading = false
        }
    }
}
