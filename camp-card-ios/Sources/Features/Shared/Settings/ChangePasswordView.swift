import SwiftUI

// MARK: - ChangePasswordViewModel

@MainActor
final class ChangePasswordViewModel: ObservableObject {

    @Published var currentPassword: String = ""
    @Published var newPassword: String = ""
    @Published var confirmPassword: String = ""

    @Published var isLoading = false
    @Published var error: String?
    @Published var showSuccessToast = false

    // Per-field visibility toggles
    @Published var showCurrentPassword = false
    @Published var showNewPassword = false
    @Published var showConfirmPassword = false

    private let api = APIClient.shared

    // MARK: - Validation

    var newPasswordStrength: PasswordStrength {
        PasswordStrength.evaluate(newPassword)
    }

    var validationError: String? {
        if currentPassword.isEmpty {
            return "Please enter your current password."
        }
        if newPassword.count < 8 {
            return "New password must be at least 8 characters."
        }
        if newPassword != confirmPassword {
            return "Passwords do not match."
        }
        if newPassword == currentPassword {
            return "New password must be different from your current password."
        }
        return nil
    }

    var isSaveEnabled: Bool {
        validationError == nil
    }

    // MARK: - Submit

    func changePassword() async {
        guard let validationError else {
            error = validationError
            return
        }
        _ = validationError // suppress warning

        isLoading = true
        error = nil
        do {
            try await api.requestVoid(
                .changePassword(current: currentPassword, new: newPassword)
            )
            showSuccessToast = true
            // Clear fields after success
            currentPassword = ""
            newPassword = ""
            confirmPassword = ""
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - Password Strength

enum PasswordStrength {
    case weak, fair, strong, veryStrong

    static func evaluate(_ password: String) -> PasswordStrength {
        guard password.count >= 8 else { return .weak }
        var score = 0
        if password.count >= 12 { score += 1 }
        if password.rangeOfCharacter(from: .uppercaseLetters) != nil { score += 1 }
        if password.rangeOfCharacter(from: .decimalDigits) != nil { score += 1 }
        if password.rangeOfCharacter(from: CharacterSet.alphanumerics.inverted) != nil { score += 1 }
        switch score {
        case 0...1: return .fair
        case 2:     return .strong
        default:    return .veryStrong
        }
    }

    var label: String {
        switch self {
        case .weak:      return "Too short"
        case .fair:      return "Fair"
        case .strong:    return "Strong"
        case .veryStrong:return "Very Strong"
        }
    }

    var color: Color {
        switch self {
        case .weak:      return .red
        case .fair:      return .orange
        case .strong:    return Color(hex: "#003F87")
        case .veryStrong:return .green
        }
    }

    var progress: Double {
        switch self {
        case .weak:      return 0.15
        case .fair:      return 0.45
        case .strong:    return 0.72
        case .veryStrong:return 1.0
        }
    }
}

// MARK: - ChangePasswordView

struct ChangePasswordView: View {

    @StateObject private var vm = ChangePasswordViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Form {
            Section("Current Password") {
                secureFormField(
                    label: "Current Password",
                    placeholder: "Enter current password",
                    text: $vm.currentPassword,
                    isVisible: $vm.showCurrentPassword
                )
            }

            Section {
                secureFormField(
                    label: "New Password",
                    placeholder: "Min. 8 characters",
                    text: $vm.newPassword,
                    isVisible: $vm.showNewPassword
                )

                if !vm.newPassword.isEmpty {
                    passwordStrengthIndicator
                }

                secureFormField(
                    label: "Confirm New Password",
                    placeholder: "Re-enter new password",
                    text: $vm.confirmPassword,
                    isVisible: $vm.showConfirmPassword
                )

                if !vm.confirmPassword.isEmpty && vm.newPassword != vm.confirmPassword {
                    Label("Passwords do not match", systemImage: "xmark.circle.fill")
                        .font(.caption)
                        .foregroundColor(.red)
                }

                if !vm.confirmPassword.isEmpty && vm.newPassword == vm.confirmPassword && vm.newPassword.count >= 8 {
                    Label("Passwords match", systemImage: "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundColor(.green)
                }

            } header: {
                Text("New Password")
            } footer: {
                Text("Use at least 8 characters. Mix letters, numbers, and symbols for a stronger password.")
                    .font(.caption)
            }

            // Password requirements checklist
            Section("Requirements") {
                requirementRow("At least 8 characters", met: vm.newPassword.count >= 8)
                requirementRow("Uppercase letter", met: vm.newPassword.rangeOfCharacter(from: .uppercaseLetters) != nil)
                requirementRow("Number", met: vm.newPassword.rangeOfCharacter(from: .decimalDigits) != nil)
                requirementRow("Special character (!@#$...)", met: vm.newPassword.rangeOfCharacter(from: CharacterSet.alphanumerics.inverted) != nil)
            }

            if let error = vm.error {
                Section {
                    ErrorBanner(message: error)
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())
            }

            // Save button
            Section {
                Button {
                    Task { await vm.changePassword() }
                } label: {
                    HStack {
                        if vm.isLoading {
                            ProgressView().progressViewStyle(.circular).tint(.white)
                        } else {
                            Text("Update Password")
                                .fontWeight(.semibold)
                        }
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(vm.isSaveEnabled ? CCColor.primary : CCColor.disabled)
                    .cornerRadius(12)
                }
                .disabled(!vm.isSaveEnabled || vm.isLoading)
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets(.init(top: 0, leading: 0, bottom: 0, trailing: 0)))
            }
        }
        .navigationTitle("Change Password")
        .navigationBarTitleDisplayMode(.inline)
        .overlay(alignment: .bottom) {
            if vm.showSuccessToast {
                SuccessToast(message: "Password updated successfully")
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .onAppear {
                        Task {
                            try? await Task.sleep(nanoseconds: 2_500_000_000)
                            withAnimation { vm.showSuccessToast = false }
                            dismiss()
                        }
                    }
                    .padding(.bottom, 24)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: vm.showSuccessToast)
    }

    // MARK: - Secure Field Builder

    private func secureFormField(
        label: String,
        placeholder: String,
        text: Binding<String>,
        isVisible: Binding<Bool>
    ) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            HStack {
                if isVisible.wrappedValue {
                    TextField(placeholder, text: text)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                } else {
                    SecureField(placeholder, text: text)
                }
                Button {
                    isVisible.wrappedValue.toggle()
                } label: {
                    Image(systemName: isVisible.wrappedValue ? "eye.slash" : "eye")
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }

    // MARK: - Password Strength Indicator

    private var passwordStrengthIndicator: some View {
        VStack(alignment: .leading, spacing: 4) {
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(CCColor.border)
                        .frame(height: 6)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(vm.newPasswordStrength.color)
                        .frame(width: geo.size.width * vm.newPasswordStrength.progress, height: 6)
                        .animation(.easeInOut(duration: 0.3), value: vm.newPasswordStrength.progress)
                }
            }
            .frame(height: 6)

            Text("Strength: \(vm.newPasswordStrength.label)")
                .font(.caption)
                .foregroundColor(vm.newPasswordStrength.color)
        }
    }

    // MARK: - Requirement Row

    private func requirementRow(_ label: String, met: Bool) -> some View {
        HStack(spacing: 8) {
            Image(systemName: met ? "checkmark.circle.fill" : "circle")
                .font(.caption)
                .foregroundColor(met ? .green : CCColor.disabled)
            Text(label)
                .font(.caption)
                .foregroundColor(met ? .primary : .secondary)
        }
    }
}
