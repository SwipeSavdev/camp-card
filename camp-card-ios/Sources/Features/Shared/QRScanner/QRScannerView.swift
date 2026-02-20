import SwiftUI
import AVFoundation

// MARK: - QRScannerView (UIViewRepresentable)

struct QRScannerView: UIViewRepresentable {
    let onCodeScanned: (String) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(onCodeScanned: onCodeScanned)
    }

    func makeUIView(context: Context) -> QRCameraPreviewView {
        let view = QRCameraPreviewView()
        view.delegate = context.coordinator
        return view
    }

    func updateUIView(_ uiView: QRCameraPreviewView, context: Context) {}

    // MARK: - Coordinator

    final class Coordinator: NSObject, AVCaptureMetadataOutputObjectsDelegate {
        private let onCodeScanned: (String) -> Void
        private var lastScannedCode: String?
        private var lastScanTime: Date?

        init(onCodeScanned: @escaping (String) -> Void) {
            self.onCodeScanned = onCodeScanned
        }

        func metadataOutput(
            _ output: AVCaptureMetadataOutput,
            didOutput metadataObjects: [AVMetadataObject],
            from connection: AVCaptureConnection
        ) {
            guard
                let metadataObject = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
                let code = metadataObject.stringValue,
                !code.isEmpty
            else { return }

            // Debounce: ignore repeated scans of the same code within 2 seconds
            let now = Date()
            if code == lastScannedCode,
               let lastTime = lastScanTime,
               now.timeIntervalSince(lastTime) < 2.0 {
                return
            }

            lastScannedCode = code
            lastScanTime = now

            // Haptic feedback on successful scan
            let feedback = UINotificationFeedbackGenerator()
            feedback.notificationOccurred(.success)

            DispatchQueue.main.async {
                self.onCodeScanned(code)
            }
        }
    }
}

// MARK: - QRCameraPreviewView (UIView subclass)

final class QRCameraPreviewView: UIView, AVCaptureMetadataOutputObjectsDelegate {
    weak var delegate: AVCaptureMetadataOutputObjectsDelegate?

    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .black
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        backgroundColor = .black
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        previewLayer?.frame = bounds
        if captureSession == nil {
            setupSession()
        }
    }

    private func setupSession() {
        let session = AVCaptureSession()

        guard let device = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device) else {
            return
        }

        if session.canAddInput(input) {
            session.addInput(input)
        }

        let metadataOutput = AVCaptureMetadataOutput()
        if session.canAddOutput(metadataOutput) {
            session.addOutput(metadataOutput)
            metadataOutput.setMetadataObjectsDelegate(delegate, queue: .main)
            metadataOutput.metadataObjectTypes = [
                .qr,
                .ean8,
                .ean13,
                .pdf417,
                .code128,
                .code39,
                .code93,
                .aztec,
                .dataMatrix
            ]
        }

        let preview = AVCaptureVideoPreviewLayer(session: session)
        preview.frame = bounds
        preview.videoGravity = .resizeAspectFill
        layer.addSublayer(preview)
        self.previewLayer = preview
        self.captureSession = session

        DispatchQueue.global(qos: .userInitiated).async {
            session.startRunning()
        }
    }

    func stopRunning() {
        captureSession?.stopRunning()
    }

    func startRunning() {
        guard let session = captureSession, !session.isRunning else { return }
        DispatchQueue.global(qos: .userInitiated).async {
            session.startRunning()
        }
    }

    func toggleTorch() {
        guard
            let device = AVCaptureDevice.default(for: .video),
            device.hasTorch,
            (try? device.lockForConfiguration()) != nil
        else { return }
        device.torchMode = device.torchMode == .on ? .off : .on
        device.unlockForConfiguration()
    }

    var isTorchOn: Bool {
        AVCaptureDevice.default(for: .video)?.torchMode == .on
    }
}

// MARK: - QRScannerContainerView

struct QRScannerContainerView: View {
    let onCodeScanned: (String) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var isTorchOn = false
    @State private var cameraPermissionDenied = false
    @State private var didScan = false

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            if cameraPermissionDenied {
                permissionDeniedView
            } else {
                cameraView
            }
        }
        .onAppear { checkCameraPermission() }
        .statusBarHidden(true)
    }

    // MARK: - Camera View

    private var cameraView: some View {
        ZStack {
            // Camera feed
            QRScannerView { code in
                guard !didScan else { return }
                didScan = true
                onCodeScanned(code)
                dismiss()
            }
            .ignoresSafeArea()

            // Overlay UI
            VStack(spacing: 0) {
                // Top bar
                topBar

                Spacer()

                // Scan frame
                scanFrame

                Spacer()

                // Bottom controls
                bottomControls
            }
        }
    }

    private var topBar: some View {
        HStack {
            Button {
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(width: 44, height: 44)
                    .background(Color.black.opacity(0.5))
                    .clipShape(Circle())
            }
            .padding(.leading, 16)

            Spacer()

            Text("Scan QR Code")
                .font(.headline)
                .foregroundColor(.white)

            Spacer()

            // Torch toggle
            Button {
                isTorchOn.toggle()
            } label: {
                Image(systemName: isTorchOn ? "bolt.fill" : "bolt.slash")
                    .font(.title3)
                    .foregroundColor(isTorchOn ? Color(hex: "#FFD700") : .white)
                    .frame(width: 44, height: 44)
                    .background(Color.black.opacity(0.5))
                    .clipShape(Circle())
            }
            .padding(.trailing, 16)
        }
        .padding(.top, 56)
        .padding(.bottom, 16)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [.black.opacity(0.6), .clear]),
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }

    private var scanFrame: some View {
        ZStack {
            // Dimmed overlay outside the scan box
            Color.black.opacity(0.55)
                .ignoresSafeArea()
                .mask(
                    Rectangle()
                        .fill(Color.black)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .frame(width: 260, height: 260)
                                .blendMode(.destinationOut)
                        )
                )

            // Corner markers
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(Color.white, lineWidth: 3)
                .frame(width: 260, height: 260)

            // Corner accent lines
            ScanCorners()
                .frame(width: 260, height: 260)
        }
    }

    private var bottomControls: some View {
        VStack(spacing: 16) {
            Text("Position a QR code within the frame to scan")
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.85))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            // Torch toggle button (secondary)
            Button {
                isTorchOn.toggle()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: isTorchOn ? "bolt.slash.fill" : "bolt.fill")
                    Text(isTorchOn ? "Turn Off Torch" : "Turn On Torch")
                        .fontWeight(.medium)
                }
                .font(.subheadline)
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(Color.white.opacity(0.15))
                .cornerRadius(24)
            }
        }
        .padding(.bottom, 56)
        .padding(.top, 24)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [.clear, .black.opacity(0.6)]),
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }

    // MARK: - Permission Denied

    private var permissionDeniedView: some View {
        VStack(spacing: 24) {
            Image(systemName: "camera.slash.fill")
                .font(.system(size: 56))
                .foregroundColor(.secondary)

            Text("Camera Access Required")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)

            Text("Camp Card needs camera access to scan QR codes. Please enable it in Settings.")
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            Button {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            } label: {
                Text("Open Settings")
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(width: 200, height: 50)
                    .background(CCColor.primary)
                    .cornerRadius(12)
            }

            Button {
                dismiss()
            } label: {
                Text("Cancel")
                    .foregroundColor(.white.opacity(0.6))
                    .font(.subheadline)
            }
        }
        .padding(32)
    }

    // MARK: - Helpers

    private func checkCameraPermission() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            cameraPermissionDenied = false
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    cameraPermissionDenied = !granted
                }
            }
        case .denied, .restricted:
            cameraPermissionDenied = true
        @unknown default:
            cameraPermissionDenied = true
        }
    }
}

// MARK: - Scan Corner Decorators

struct ScanCorners: View {
    private let length: CGFloat = 28
    private let lineWidth: CGFloat = 4
    private let color = CCColor.primary

    var body: some View {
        ZStack {
            // Top-left
            cornerShape(rotation: 0)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            // Top-right
            cornerShape(rotation: 90)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
            // Bottom-left
            cornerShape(rotation: 270)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
            // Bottom-right
            cornerShape(rotation: 180)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
        }
    }

    private func cornerShape(rotation: Double) -> some View {
        CornerBracket(length: length, lineWidth: lineWidth)
            .stroke(color, lineWidth: lineWidth)
            .frame(width: length + lineWidth / 2, height: length + lineWidth / 2)
            .rotationEffect(.degrees(rotation))
    }
}

struct CornerBracket: Shape {
    let length: CGFloat
    let lineWidth: CGFloat

    func path(in rect: CGRect) -> Path {
        var path = Path()
        // Draws an L-shape from the top-left corner
        path.move(to: CGPoint(x: rect.minX, y: rect.minY + length))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.minX + length, y: rect.minY))
        return path
    }
}
