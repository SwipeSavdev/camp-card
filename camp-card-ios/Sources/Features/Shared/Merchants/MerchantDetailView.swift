import SwiftUI

// MARK: - ViewModel

@MainActor
final class MerchantDetailViewModel: ObservableObject {
    @Published var merchant: Merchant?
    @Published var merchantOffers: [Offer] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func load(merchantId: Int) async {
        isLoading = true
        error = nil
        do {
            async let merchantResult: Merchant = api.request(.merchantDetail(id: merchantId))
            async let offersPage: Page<Offer> = api.request(.merchantOffers(merchantId: merchantId))
            let (m, o) = try await (merchantResult, offersPage)
            merchant = m
            merchantOffers = o.content
        } catch {
            // Offers may not be available — try merchant alone
            do {
                let m: Merchant = try await api.request(.merchantDetail(id: merchantId))
                merchant = m
                merchantOffers = []
            } catch {
                self.error = (error as? NetworkError)?.errorDescription ?? error.localizedDescription
            }
        }
        isLoading = false
    }
}

// MARK: - MerchantDetailView

struct MerchantDetailView: View {
    let merchantId: Int

    @StateObject private var vm = MerchantDetailViewModel()

    var body: some View {
        Group {
            if vm.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = vm.error {
                errorView(message: error)
            } else if let merchant = vm.merchant {
                merchantContentView(merchant: merchant)
            }
        }
        .navigationTitle(vm.merchant?.businessName ?? "Merchant")
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load(merchantId: merchantId) }
    }

    // MARK: - Content

    private func merchantContentView(merchant: Merchant) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                headerSection(merchant: merchant)
                VStack(alignment: .leading, spacing: 24) {
                    if let description = merchant.description, !description.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            SectionHeader(title: "About")
                            Text(description)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                    if let locations = merchant.locations, !locations.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            SectionHeader(title: "Locations (\(locations.count))")
                            ForEach(locations) { location in
                                LocationRow(location: location)
                            }
                        }
                    }
                    if !vm.merchantOffers.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            SectionHeader(title: "Offers (\(vm.merchantOffers.count))")
                            ForEach(vm.merchantOffers) { offer in
                                NavigationLink(destination: OfferDetailView(offerId: offer.id)) {
                                    OfferRowCard(offer: offer)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    } else {
                        VStack(alignment: .leading, spacing: 8) {
                            SectionHeader(title: "Offers")
                            Text("No offers available for this merchant.")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding(20)
            }
        }
    }

    // MARK: - Header (80x80 circle logo, name, category, status pill, website)

    private func headerSection(merchant: Merchant) -> some View {
        VStack(spacing: 16) {
            merchantLogoCircle(merchant: merchant)

            VStack(spacing: 6) {
                Text(merchant.businessName)
                    .font(.system(size: 24, weight: .bold))
                    .multilineTextAlignment(.center)

                if let category = merchant.category {
                    Text(category.capitalized)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                // Status badge pill
                let isActive = merchant.status.uppercased() == "ACTIVE"
                Text(merchant.status.capitalized)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(isActive ? CCColor.success : .secondary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background((isActive ? CCColor.success : Color.secondary).opacity(0.12))
                    .cornerRadius(20)
            }

            if let website = merchant.website, !website.isEmpty, let url = URL(string: website) {
                Link(destination: url) {
                    HStack(spacing: 6) {
                        Image(systemName: "globe")
                        Text("Visit Website")
                            .fontWeight(.medium)
                    }
                    .font(.subheadline)
                    .foregroundColor(CCColor.secondary)
                    .padding(.horizontal, 18)
                    .padding(.vertical, 9)
                    .background(CCColor.secondary.opacity(0.1))
                    .cornerRadius(20)
                }
                .accessibilityLabel("Visit \(merchant.businessName) website")
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .padding(.horizontal, 20)
        .background(CCColor.surface)
    }

    @ViewBuilder
    private func merchantLogoCircle(merchant: Merchant) -> some View {
        if let logoUrl = merchant.logoUrl, !logoUrl.isEmpty {
            AsyncImage(url: URL(string: logoUrl)) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                default:
                    merchantInitialCircle(merchant)
                }
            }
            .frame(width: 80, height: 80)
            .clipShape(Circle())
            .shadow(color: .black.opacity(0.08), radius: 6, x: 0, y: 3)
        } else {
            merchantInitialCircle(merchant)
                .shadow(color: .black.opacity(0.08), radius: 6, x: 0, y: 3)
        }
    }

    private func merchantInitialCircle(_ merchant: Merchant) -> some View {
        ZStack {
            Circle()
                .fill(CCColor.secondary.opacity(0.15))
                .frame(width: 80, height: 80)
            Text(String(merchant.businessName.prefix(1)).uppercased())
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(CCColor.secondary)
        }
    }

    // MARK: - Error

    private func errorView(message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundColor(.secondary)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Button("Try Again") {
                Task { await vm.load(merchantId: merchantId) }
            }
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(.white)
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(CCColor.primary)
            .cornerRadius(8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - SectionHeader

struct SectionHeader: View {
    let title: String

    var body: some View {
        Text(title)
            .font(.headline)
            .foregroundColor(.primary)
    }
}

// MARK: - LocationRow

struct LocationRow: View {
    let location: MerchantLocation

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "mappin.circle.fill")
                .foregroundColor(CCColor.primary)
                .font(.title3)
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: 3) {
                if let name = location.locationName, !name.isEmpty {
                    Text(name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                }
                Text(location.streetAddress)
                    .font(.subheadline)
                    .foregroundColor(.primary)
                Text("\(location.city), \(location.state) \(location.zipCode)")
                    .font(.caption)
                    .foregroundColor(.secondary)

                if let phone = location.phone, !phone.isEmpty {
                    Button {
                        if let url = URL(string: "tel:\(phone.filter { $0.isNumber })") {
                            UIApplication.shared.open(url)
                        }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "phone")
                                .font(.caption2)
                            Text(phone)
                                .font(.caption)
                        }
                        .foregroundColor(CCColor.secondary)
                    }
                    .padding(.top, 2)
                    .accessibilityLabel("Call \(phone)")
                }

                if let hours = location.hours, !hours.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.caption2)
                        Text(hours)
                            .font(.caption)
                    }
                    .foregroundColor(.secondary)
                    .padding(.top, 2)
                }

                if location.primaryLocation == true {
                    Text("Primary Location")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundColor(CCColor.secondary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(CCColor.secondary.opacity(0.1))
                        .cornerRadius(10)
                        .padding(.top, 4)
                }
            }

            Spacer()
        }
        .padding(14)
        .background(CCColor.card)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 3, x: 0, y: 1)
    }
}
