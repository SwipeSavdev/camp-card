import SwiftUI

struct RedemptionHistoryView: View {
    @State private var records: [RedemptionRecord] = []
    @State private var isLoading = false

    var body: some View {
        NavigationStack {
            Group {
                if isLoading { ProgressView().frame(maxWidth: .infinity, minHeight: 200) }
                else if records.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "clock.arrow.circlepath").font(.largeTitle).foregroundColor(.secondary)
                        Text("No redemptions yet").foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(records) { record in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(record.offerTitle).font(.subheadline).fontWeight(.medium).lineLimit(1)
                                Spacer()
                                Text(record.discountType == "PERCENTAGE" ? "\(Int(record.discountValue))%" : "$\(String(format: "%.2f", record.discountValue))")
                                    .font(.subheadline).fontWeight(.semibold).foregroundColor(CCColor.primary)
                            }
                            Text(record.merchantName).font(.caption).foregroundColor(.secondary)
                            Text(record.redeemedAt.prefix(10)).font(.caption2).foregroundColor(.secondary)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("Redemption History").navigationBarTitleDisplayMode(.inline)
            .task { await load() }
            .refreshable { await load() }
        }
    }

    private func load() async {
        isLoading = true
        records = (try? await APIClient.shared.request(.redemptionHistory(page: 0, size: 50))) ?? []
        isLoading = false
    }
}
