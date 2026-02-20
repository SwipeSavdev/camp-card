import SwiftUI
import CoreImage.CIFilterBuiltins

// MARK: - ScoutQRCodeView
// Matches RN ScoutDashboardScreen QR code section

struct ScoutQRCodeView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @State private var qrCode: QRCodeResponse?
    @State private var isLoading = false
    @State private var qrImage: UIImage?

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {

                // MARK: Header
                VStack(spacing: 8) {
                    Text("My Affiliate QR Code")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(CCColor.text)
                    Text("Share this QR code so others can track purchases back to you and earn you credit.")
                        .font(.system(size: 14))
                        .foregroundColor(CCColor.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 16)
                }

                // MARK: QR Card
                VStack(spacing: 16) {
                    if isLoading {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(CCColor.border)
                            .frame(width: 220, height: 220)
                            .shimmer()
                    } else if let qrImg = qrImage {
                        Image(uiImage: qrImg)
                            .interpolation(.none)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 220, height: 220)
                            .padding(20)
                            .background(Color.white)
                            .cornerRadius(16)
                            .shadow(color: .black.opacity(0.12), radius: 12, x: 0, y: 4)
                            .accessibilityLabel("Your affiliate QR code. Scan to track purchases.")
                    } else {
                        VStack(spacing: 12) {
                            Image(systemName: "qrcode")
                                .font(.system(size: 64))
                                .foregroundColor(CCColor.textSecondary)
                            Text("QR code unavailable")
                                .font(.subheadline)
                                .foregroundColor(CCColor.textSecondary)
                        }
                        .frame(width: 220, height: 220)
                        .background(CCColor.surface)
                        .cornerRadius(16)
                    }

                    // Code label
                    if let code = qrCode?.uniqueCode {
                        HStack(spacing: 6) {
                            Image(systemName: "number")
                                .font(.system(size: 12))
                                .foregroundColor(CCColor.textSecondary)
                            Text(code)
                                .font(.system(size: 13, design: .monospaced))
                                .foregroundColor(CCColor.textSecondary)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background(CCColor.surface)
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(CCColor.border, lineWidth: 1))
                    }
                }
                .padding(.horizontal, 24)

                // MARK: Action Buttons
                VStack(spacing: 12) {
                    // Share button — primary red, matches RN
                    Button(action: shareQR) {
                        HStack(spacing: 8) {
                            Image(systemName: "square.and.arrow.up")
                            Text("Share QR Code")
                                .font(.system(size: 16, weight: .semibold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(isLoading || qrImage == nil ? CCColor.primary.opacity(0.6) : CCColor.primary)
                        .cornerRadius(12)
                    }
                    .disabled(isLoading || qrImage == nil)
                    .accessibilityLabel("Share your affiliate QR code")

                    // Refresh button — outline style
                    Button(action: { Task { await loadQR() } }) {
                        HStack(spacing: 8) {
                            Image(systemName: "arrow.clockwise")
                            Text("Refresh Code")
                                .font(.system(size: 16, weight: .semibold))
                        }
                        .foregroundColor(CCColor.secondary)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Color.white)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(CCColor.secondary, lineWidth: 1.5)
                        )
                    }
                    .disabled(isLoading)
                    .accessibilityLabel("Refresh your QR code")
                }
                .padding(.horizontal, 24)

                // MARK: Info card
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 8) {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(CCColor.secondary)
                        Text("How it works")
                            .font(.system(size: 15, weight: .semibold))
                    }
                    Text("When someone scans your QR code before making a purchase at a participating merchant, you receive credit for the referral and earn rewards.")
                        .font(.system(size: 13))
                        .foregroundColor(CCColor.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(16)
                .background(CCColor.secondary.opacity(0.08))
                .cornerRadius(12)
                .padding(.horizontal, 24)
            }
            .padding(.top, 24)
            .padding(.bottom, 40)
        }
        .navigationTitle("My QR Code")
        .navigationBarTitleDisplayMode(.inline)
        .ccScreenBackground()
        .task { await loadQR() }
    }

    private func loadQR() async {
        isLoading = true
        do {
            qrCode = try await APIClient.shared.request(.qrCode)
            if let uniqueCode = qrCode?.uniqueCode {
                qrImage = generateQR(from: uniqueCode)
            }
        } catch {}
        isLoading = false
    }

    private func generateQR(from string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"
        guard let ciImage = filter.outputImage else { return nil }
        let scaled = ciImage.transformed(by: CGAffineTransform(scaleX: 12, y: 12))
        guard let cgImage = context.createCGImage(scaled, from: scaled.extent) else { return nil }
        return UIImage(cgImage: cgImage)
    }

    private func shareQR() {
        guard let qrImg = qrImage else { return }
        let code = qrCode?.uniqueCode ?? ""
        let url = qrCode?.qrCodeUrl.flatMap { URL(string: $0) }
            ?? URL(string: "https://campcardapp.org/ref/\(code)")!
        let controller = UIActivityViewController(
            activityItems: [qrImg, url],
            applicationActivities: nil
        )
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?.windows.first?.rootViewController?
            .present(controller, animated: true)
    }
}
