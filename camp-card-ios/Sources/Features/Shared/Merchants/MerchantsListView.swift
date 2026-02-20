import SwiftUI

// MARK: - Category Constants (matches RN MerchantsScreen categories)

private let kAllCategory = "ALL"
private let kMerchantCategories = [
    "ALL", "RESTAURANTS", "RETAIL", "SERVICES",
    "ENTERTAINMENT", "AUTOMOTIVE", "HEALTH"
]

// MARK: - ViewModel

@MainActor
final class MerchantsListViewModel: ObservableObject {
    @Published var allMerchants: [Merchant] = []
    @Published var searchText: String = ""
    @Published var selectedCategory: String = kAllCategory
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    var filteredMerchants: [Merchant] {
        var result = allMerchants
        if selectedCategory != kAllCategory {
            result = result.filter { $0.category?.uppercased() == selectedCategory }
        }
        if !searchText.isEmpty {
            let lower = searchText.lowercased()
            result = result.filter {
                $0.businessName.lowercased().contains(lower)
                    || ($0.category?.lowercased().contains(lower) ?? false)
                    || ($0.description?.lowercased().contains(lower) ?? false)
            }
        }
        return result
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            let page: Page<Merchant> = try await api.request(.merchants(page: 0, size: 100))
            allMerchants = page.content
        } catch {
            self.error = (error as? NetworkError)?.errorDescription ?? error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - MerchantsListView

struct MerchantsListView: View {
    @StateObject private var vm = MerchantsListViewModel()

    var body: some View {
        VStack(spacing: 0) {
            searchBar
            categoryChips
            Group {
                if vm.isLoading {
                    SkeletonList(count: 8) { SkeletonMerchantRow() }
                } else if let error = vm.error {
                    errorView(message: error)
                } else if vm.filteredMerchants.isEmpty {
                    emptyView
                } else {
                    merchantList
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .navigationTitle("Merchants")
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load() }
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            TextField("Search merchants...", text: $vm.searchText)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                .accessibilityLabel("Search merchants")
            if !vm.searchText.isEmpty {
                Button {
                    vm.searchText = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                }
                .accessibilityLabel("Clear search")
            }
        }
        .padding(10)
        .background(CCColor.surface)
        .cornerRadius(10)
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    // MARK: - Category Chips

    private var categoryChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(kMerchantCategories, id: \.self) { category in
                    let label = category == kAllCategory ? "All" : category.capitalized
                    let isSelected = vm.selectedCategory == category
                    Button {
                        vm.selectedCategory = category
                    } label: {
                        Text(label)
                            .font(.caption)
                            .fontWeight(isSelected ? .semibold : .regular)
                            .foregroundColor(isSelected ? .white : CCColor.text)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 7)
                            .background(isSelected ? CCColor.primary : CCColor.surface)
                            .cornerRadius(20)
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(isSelected ? CCColor.primary : CCColor.border, lineWidth: 1)
                            )
                    }
                    .animation(.easeInOut(duration: 0.15), value: isSelected)
                    .accessibilityLabel("\(label)\(isSelected ? ", selected" : "")")
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
        }
    }

    // MARK: - List

    private var merchantList: some View {
        List {
            ForEach(vm.filteredMerchants) { merchant in
                NavigationLink(destination: MerchantDetailView(merchantId: merchant.id)) {
                    MerchantListRow(merchant: merchant)
                }
                .listRowSeparatorTint(CCColor.border)
                .accessibilityLabel(accessibilityLabel(for: merchant))
            }
        }
        .listStyle(.plain)
        .refreshable { await vm.load() }
    }

    // MARK: - Error / Empty

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
                Task { await vm.load() }
            }
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(.white)
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(CCColor.primary)
            .cornerRadius(8)
        }
    }

    private var emptyView: some View {
        VStack(spacing: 16) {
            Image(systemName: "storefront")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            Text(vm.searchText.isEmpty && vm.selectedCategory == kAllCategory
                 ? "No merchants available right now."
                 : "No merchants match your search.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(32)
    }

    private func accessibilityLabel(for merchant: Merchant) -> String {
        var parts = [merchant.businessName]
        if let category = merchant.category { parts.append(category) }
        if let count = merchant.locations?.count, count > 0 {
            parts.append("\(count) location\(count == 1 ? "" : "s")")
        }
        return parts.joined(separator: ", ")
    }
}

// MARK: - MerchantListRow

struct MerchantListRow: View {
    let merchant: Merchant

    var body: some View {
        HStack(spacing: 14) {
            merchantLogo
            VStack(alignment: .leading, spacing: 4) {
                Text(merchant.businessName)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(CCColor.text)
                if let category = merchant.category {
                    HStack(spacing: 4) {
                        Image(systemName: "tag")
                            .font(.caption2)
                        Text(category.capitalized)
                            .font(.caption)
                    }
                    .foregroundColor(.secondary)
                }
                if let locationCount = merchant.locations?.count, locationCount > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle")
                            .font(.caption2)
                        Text("\(locationCount) location\(locationCount == 1 ? "" : "s")")
                            .font(.caption)
                    }
                    .foregroundColor(.secondary)
                }
            }
            Spacer()
        }
        .padding(.vertical, 6)
    }

    @ViewBuilder
    private var merchantLogo: some View {
        if let logoUrl = merchant.logoUrl, !logoUrl.isEmpty {
            AsyncImage(url: URL(string: logoUrl)) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                default:
                    initialCircle
                }
            }
            .frame(width: 48, height: 48)
            .clipShape(Circle())
        } else {
            initialCircle
        }
    }

    private var initialCircle: some View {
        ZStack {
            Circle()
                .fill(CCColor.secondary.opacity(0.15))
                .frame(width: 48, height: 48)
            Text(String(merchant.businessName.prefix(1)).uppercased())
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(CCColor.secondary)
        }
    }
}
