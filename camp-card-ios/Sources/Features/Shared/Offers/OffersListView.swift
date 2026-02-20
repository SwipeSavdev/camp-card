import SwiftUI

// MARK: - ViewModel

@MainActor
final class OffersListViewModel: ObservableObject {
    @Published var allOffers: [Offer] = []
    @Published var isLoading = false
    @Published var error: String?
    @Published var searchText = ""
    @Published var selectedCategory = "ALL"

    let categories = ["ALL", "RESTAURANTS", "RETAIL", "SERVICES", "ENTERTAINMENT", "AUTOMOTIVE", "HEALTH"]

    private let api = APIClient.shared

    var filtered: [Offer] {
        allOffers.filter { offer in
            let matchCat = selectedCategory == "ALL" || (offer.category?.uppercased() == selectedCategory)
            let matchSearch = searchText.isEmpty ||
                offer.title.localizedCaseInsensitiveContains(searchText) ||
                offer.merchantName.localizedCaseInsensitiveContains(searchText)
            return matchCat && matchSearch
        }
    }

    func load() async {
        guard allOffers.isEmpty else { return }
        isLoading = true; error = nil
        do {
            let page: Page<Offer> = try await api.request(.offers(page: 0, size: 100))
            allOffers = page.content
        } catch {
            self.error = (error as? NetworkError)?.errorDescription ?? error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - OffersListView

struct OffersListView: View {
    @StateObject private var vm = OffersListViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Search bar
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(CCColor.textSecondary)
                TextField("Search offers...", text: $vm.searchText)
                    .font(.system(size: 16))
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .accessibilityLabel("Search offers")
                if !vm.searchText.isEmpty {
                    Button {
                        vm.searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(CCColor.textSecondary)
                    }
                    .accessibilityLabel("Clear search")
                }
            }
            .padding(.horizontal, 14)
            .frame(height: 46)
            .background(CCColor.surface)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(CCColor.border, lineWidth: 1))
            .padding(.horizontal, 16)
            .padding(.vertical, 12)

            // Category filter chips (fixed BSA categories)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(vm.categories, id: \.self) { cat in
                        CategoryChip(
                            label: cat == "ALL" ? "All" : cat.capitalized,
                            isSelected: vm.selectedCategory == cat,
                            action: { vm.selectedCategory = cat }
                        )
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
            }

            Divider()

            // Content
            Group {
                if vm.isLoading {
                    SkeletonList(count: 8) { SkeletonOfferRow() }
                } else if let err = vm.error {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(CCColor.textSecondary)
                        Text(err)
                            .font(.subheadline)
                            .foregroundColor(CCColor.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                        Button("Try Again") {
                            Task { vm.allOffers = []; await vm.load() }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(CCColor.primary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(32)
                } else if vm.filtered.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "tag.slash")
                            .font(.system(size: 48))
                            .foregroundColor(CCColor.textSecondary)
                        Text(vm.searchText.isEmpty && vm.selectedCategory == "ALL"
                             ? "No offers available right now."
                             : "No offers match your search.")
                            .font(.subheadline)
                            .foregroundColor(CCColor.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(32)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(vm.filtered) { offer in
                                NavigationLink(destination: OfferDetailView(offerId: offer.id)) {
                                    OfferRowCard(offer: offer)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 6)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.bottom, 32)
                    }
                    .refreshable { vm.allOffers = []; await vm.load() }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .navigationTitle("Offers")
        .navigationBarTitleDisplayMode(.inline)
        .ccScreenBackground()
        .task { await vm.load() }
    }
}

// MARK: - CategoryChip

struct CategoryChip: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 13, weight: isSelected ? .semibold : .regular))
                .foregroundColor(isSelected ? .white : CCColor.text)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(isSelected ? CCColor.primary : CCColor.surface)
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(isSelected ? CCColor.primary : CCColor.border, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.15), value: isSelected)
        .accessibilityLabel("\(label) category\(isSelected ? ", selected" : "")")
    }
}

// MARK: - OfferRowCard
// Reusable card used across the app (Scout home, Parent home, Offers list)

struct OfferRowCard: View {
    let offer: Offer

    var body: some View {
        HStack(spacing: 14) {
            // Merchant logo circle
            ZStack {
                Circle()
                    .fill(CCColor.primary.opacity(0.10))
                    .frame(width: 52, height: 52)
                if let logoUrl = offer.merchantLogoUrl ?? offer.imageUrl,
                   let url = URL(string: logoUrl) {
                    AsyncImage(url: url) { img in
                        img.resizable().scaledToFill()
                    } placeholder: {
                        Image(systemName: "building.2.fill")
                            .font(.system(size: 22))
                            .foregroundColor(CCColor.primary)
                    }
                    .frame(width: 52, height: 52)
                    .clipShape(Circle())
                } else {
                    Image(systemName: "building.2.fill")
                        .font(.system(size: 22))
                        .foregroundColor(CCColor.primary)
                }
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(offer.merchantName)
                    .font(.system(size: 12))
                    .foregroundColor(CCColor.textSecondary)
                    .lineLimit(1)
                Text(offer.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(CCColor.text)
                    .lineLimit(2)
                if let cat = offer.category {
                    Text(cat.capitalized)
                        .font(.system(size: 11))
                        .foregroundColor(CCColor.textSecondary)
                }
            }

            Spacer()

            // Discount badge
            Text(offer.displayDiscount)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(CCColor.primary)
                .cornerRadius(8)
        }
        .padding(14)
        .background(CCColor.card)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(offer.title) by \(offer.merchantName), \(offer.displayDiscount) discount")
    }
}
