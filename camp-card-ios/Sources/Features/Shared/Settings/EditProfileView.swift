import SwiftUI

// MARK: - EditProfileViewModel

@MainActor
final class EditProfileViewModel: ObservableObject {

    @Published var firstName: String = ""
    @Published var lastName: String = ""
    @Published var email: String = ""
    @Published var phone: String = ""

    @Published var isLoading = false
    @Published var error: String?
    @Published var showSuccessToast = false

    private let api = APIClient.shared

    func populate(from user: User) {
        firstName = user.firstName
        lastName = user.lastName
        email = user.email
        // Phone is optional — User model doesn't carry it directly;
        // it may come from a separate profile fetch. Start empty.
        phone = ""
    }

    var isSaveEnabled: Bool {
        !firstName.trimmingCharacters(in: .whitespaces).isEmpty &&
        !lastName.trimmingCharacters(in: .whitespaces).isEmpty
    }

    func save(auth: AuthViewModel) async {
        isLoading = true
        error = nil

        let body = UpdateProfileRequest(
            firstName: firstName.trimmingCharacters(in: .whitespaces),
            lastName: lastName.trimmingCharacters(in: .whitespaces),
            phone: phone.trimmingCharacters(in: .whitespaces).isEmpty ? nil : phone.trimmingCharacters(in: .whitespaces)
        )

        do {
            let updated: User = try await api.request(.updateProfile(body: body))
            auth.updateUser(updated)
            showSuccessToast = true
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}

// MARK: - Request DTO

private struct UpdateProfileRequest: Encodable {
    let firstName: String
    let lastName: String
    let phone: String?
}

// MARK: - EditProfileView

struct EditProfileView: View {

    @EnvironmentObject private var auth: AuthViewModel
    @StateObject private var vm = EditProfileViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var showPasswordField = false

    var body: some View {
        Form {
            // Avatar Section
            Section {
                avatarPreview
            }
            .listRowBackground(Color.clear)

            // Name Fields
            Section("Name") {
                formField(label: "First Name", placeholder: "Enter first name", text: $vm.firstName)
                formField(label: "Last Name", placeholder: "Enter last name", text: $vm.lastName)
            }

            // Contact Fields
            Section("Contact") {
                // Email — read-only (changing email requires verification flow)
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Email")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(vm.email)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Image(systemName: "lock.fill")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 4)

                formField(
                    label: "Phone (optional)",
                    placeholder: "+1 (555) 000-0000",
                    text: $vm.phone,
                    keyboardType: .phonePad
                )
            }

            // Error
            if let error = vm.error {
                Section {
                    ErrorBanner(message: error)
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())
            }
        }
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                if vm.isLoading {
                    ProgressView().progressViewStyle(.circular)
                } else {
                    Button("Save") {
                        Task { await vm.save(auth: auth) }
                    }
                    .fontWeight(.semibold)
                    .disabled(!vm.isSaveEnabled)
                }
            }
        }
        .onAppear {
            if let user = auth.user {
                vm.populate(from: user)
            }
        }
        .overlay(alignment: .bottom) {
            if vm.showSuccessToast {
                SuccessToast(message: "Profile updated successfully")
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .onAppear {
                        Task {
                            try? await Task.sleep(nanoseconds: 2_500_000_000)
                            withAnimation { vm.showSuccessToast = false }
                        }
                    }
                    .padding(.bottom, 16)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: vm.showSuccessToast)
    }

    // MARK: - Avatar Preview

    private var avatarPreview: some View {
        HStack {
            Spacer()
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color(hex: auth.user?.role.themeColor ?? "#003F87"))
                        .frame(width: 72, height: 72)
                    Text(initials)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                Text(displayName)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            Spacer()
        }
        .padding(.vertical, 8)
    }

    private var initials: String {
        let f = vm.firstName.first.map(String.init) ?? ""
        let l = vm.lastName.first.map(String.init) ?? ""
        return "\(f)\(l)".uppercased()
    }

    private var displayName: String {
        let fn = vm.firstName.trimmingCharacters(in: .whitespaces)
        let ln = vm.lastName.trimmingCharacters(in: .whitespaces)
        if fn.isEmpty && ln.isEmpty { return auth.user?.email ?? "" }
        return "\(fn) \(ln)".trimmingCharacters(in: .whitespaces)
    }

    // MARK: - Form Field Helper

    private func formField(
        label: String,
        placeholder: String,
        text: Binding<String>,
        keyboardType: UIKeyboardType = .default
    ) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            TextField(placeholder, text: text)
                .keyboardType(keyboardType)
                .autocorrectionDisabled()
                .textInputAutocapitalization(keyboardType == .phonePad ? .never : .words)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - SuccessToast

struct SuccessToast: View {
    let message: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.green)
            Text(message)
                .font(.subheadline)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(
            Capsule()
                .fill(CCColor.card)
                .shadow(color: .black.opacity(0.15), radius: 8, x: 0, y: 4)
        )
    }
}
