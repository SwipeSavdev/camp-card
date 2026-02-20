import SwiftUI

// MARK: - Shimmer modifier

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = -0.3

    func body(content: Content) -> some View {
        content
            .overlay(
                GeometryReader { geo in
                    LinearGradient(
                        stops: [
                            .init(color: .clear, location: 0),
                            .init(color: .white.opacity(0.45), location: 0.5),
                            .init(color: .clear, location: 1)
                        ],
                        startPoint: UnitPoint(x: phase, y: 0),
                        endPoint: UnitPoint(x: phase + 0.6, y: 0)
                    )
                    .blendMode(.plusLighter)
                }
                .allowsHitTesting(false)
            )
            .onAppear {
                withAnimation(.linear(duration: 1.4).repeatForever(autoreverses: false)) {
                    phase = 1.3
                }
            }
    }
}

extension View {
    func shimmer() -> some View {
        modifier(ShimmerModifier())
    }
}

// MARK: - Skeleton shapes

struct SkeletonRect: View {
    var width: CGFloat? = nil
    var height: CGFloat = 14
    var cornerRadius: CGFloat = 6

    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius)
            .fill(CCColor.border)
            .frame(width: width, height: height)
            .shimmer()
    }
}

// MARK: - Offer row skeleton (matches OfferRowCard layout)

struct SkeletonOfferRow: View {
    var body: some View {
        HStack(spacing: 12) {
            SkeletonRect(width: 64, height: 64, cornerRadius: 10)
            VStack(alignment: .leading, spacing: 6) {
                SkeletonRect(width: 80, height: 10)
                SkeletonRect(height: 13)
                SkeletonRect(width: 60, height: 10)
            }
            Spacer()
            SkeletonRect(width: 44, height: 28, cornerRadius: 8)
        }
        .padding(12)
        .background(CCColor.surface)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Merchant row skeleton

struct SkeletonMerchantRow: View {
    var body: some View {
        HStack(spacing: 12) {
            SkeletonRect(width: 48, height: 48, cornerRadius: 8)
            VStack(alignment: .leading, spacing: 6) {
                SkeletonRect(height: 13)
                SkeletonRect(width: 100, height: 10)
            }
            Spacer()
            SkeletonRect(width: 28, height: 28, cornerRadius: 14)
        }
        .padding(12)
        .background(CCColor.surface)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Notification row skeleton

struct SkeletonNotificationRow: View {
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            SkeletonRect(width: 40, height: 40, cornerRadius: 20)
            VStack(alignment: .leading, spacing: 6) {
                SkeletonRect(height: 13)
                SkeletonRect(width: 180, height: 10)
                SkeletonRect(width: 70, height: 9)
            }
        }
        .padding(12)
    }
}

// MARK: - Card skeleton (matches scout card panel)

struct SkeletonCardPanel: View {
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16)
                .fill(CCColor.border)
                .frame(height: 160)
                .shimmer()
        }
    }
}

// MARK: - Dashboard skeleton

struct SkeletonDashboard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            SkeletonCardPanel()
            HStack(spacing: 12) {
                ForEach(0..<3, id: \.self) { _ in
                    SkeletonRect(height: 72, cornerRadius: 12)
                        .frame(maxWidth: .infinity)
                }
            }
            VStack(alignment: .leading, spacing: 12) {
                SkeletonRect(width: 120, height: 16)
                ForEach(0..<3, id: \.self) { _ in SkeletonOfferRow() }
            }
        }
        .padding(.horizontal, 16)
    }
}

// MARK: - List skeleton (generic)

struct SkeletonList<RowContent: View>: View {
    let count: Int
    let row: () -> RowContent

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(0..<count, id: \.self) { _ in row() }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
        }
        .disabled(true)
    }
}
