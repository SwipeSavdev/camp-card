import SwiftUI
import MapKit
import CoreLocation

struct MapPin: Identifiable {
    let id: Int
    let businessName: String
    let category: String?
    let coordinate: CLLocationCoordinate2D
    let address: String?
}

@MainActor
final class NearbyMerchantsMapViewModel: ObservableObject {
    @Published var pins: [MapPin] = []
    @Published var selectedPin: MapPin?
    @Published var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 39.8283, longitude: -98.5795),
        span: MKCoordinateSpan(latitudeDelta: 5.0, longitudeDelta: 5.0)
    )
    @Published var locationDenied = false
    @Published var isLoading = false

    private let locationManager = CLLocationManager()

    func load() async {
        isLoading = true
        defer { isLoading = false }

        let page: Page<Merchant> = (try? await APIClient.shared.request(.merchants(page: 0, size: 200))) ?? Page(content: [], totalElements: 0, totalPages: 0, number: 0, size: 0, first: true, last: true)
        pins = page.content.flatMap { merchant in
            (merchant.locations ?? []).compactMap { loc -> MapPin? in
                guard let lat = loc.latitude, let lon = loc.longitude else { return nil }
                let addr = [loc.streetAddress, loc.city, loc.state].joined(separator: ", ")
                return MapPin(
                    id: loc.id,
                    businessName: merchant.businessName,
                    category: merchant.category,
                    coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lon),
                    address: addr
                )
            }
        }

        // Center on user location if available
        switch locationManager.authorizationStatus {
        case .denied, .restricted:
            locationDenied = true
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
        default:
            if let loc = locationManager.location {
                region = MKCoordinateRegion(
                    center: loc.coordinate,
                    span: MKCoordinateSpan(latitudeDelta: 0.5, longitudeDelta: 0.5)
                )
            }
        }
    }
}

struct NearbyMerchantsMapView: View {
    @StateObject private var vm = NearbyMerchantsMapViewModel()

    var body: some View {
        ZStack(alignment: .bottom) {
            Map(coordinateRegion: $vm.region, showsUserLocation: true,
                annotationItems: vm.pins) { pin in
                MapAnnotation(coordinate: pin.coordinate) {
                    MerchantPin(pin: pin, isSelected: vm.selectedPin?.id == pin.id)
                        .onTapGesture {
                            withAnimation { vm.selectedPin = vm.selectedPin?.id == pin.id ? nil : pin }
                        }
                }
            }
            .ignoresSafeArea(edges: .top)

            if vm.isLoading {
                ProgressView("Loading merchants…")
                    .padding()
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .padding(.bottom, 80)
            } else if let pin = vm.selectedPin {
                MerchantCallout(pin: pin) {
                    withAnimation { vm.selectedPin = nil }
                }
                .padding()
                .transition(.move(edge: .bottom).combined(with: .opacity))
            } else if !vm.pins.isEmpty {
                Text("\(vm.pins.count) locations")
                    .font(.caption).fontWeight(.medium)
                    .padding(.horizontal, 12).padding(.vertical, 6)
                    .background(.regularMaterial, in: Capsule())
                    .padding(.bottom, 16)
            }

            if vm.locationDenied {
                HStack {
                    Image(systemName: "location.slash").foregroundColor(.orange)
                    Text("Enable location for nearby results").font(.caption)
                    Spacer()
                    Button("Settings") {
                        if let url = URL(string: UIApplication.openSettingsURLString) {
                            UIApplication.shared.open(url)
                        }
                    }
                    .font(.caption).fontWeight(.semibold)
                }
                .padding()
                .background(.regularMaterial)
                .frame(maxWidth: .infinity)
            }
        }
        .navigationTitle("Nearby Merchants")
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load() }
    }
}

private struct MerchantPin: View {
    let pin: MapPin
    let isSelected: Bool

    var body: some View {
        VStack(spacing: 0) {
            Text(String(pin.businessName.prefix(1)).uppercased())
                .font(.caption).fontWeight(.bold).foregroundColor(.white)
                .frame(width: isSelected ? 36 : 28, height: isSelected ? 36 : 28)
                .background(isSelected ? CCColor.primary : Color(hex: "#003F87"))
                .clipShape(Circle())
                .shadow(radius: isSelected ? 4 : 2)
            Image(systemName: "arrowtriangle.down.fill")
                .font(.system(size: 8))
                .foregroundColor(isSelected ? CCColor.primary : Color(hex: "#003F87"))
                .offset(y: -2)
        }
        .animation(.spring(response: 0.3), value: isSelected)
    }
}

private struct MerchantCallout: View {
    let pin: MapPin
    let onDismiss: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Circle().fill(Color(hex: "#003F87")).frame(width: 44, height: 44)
                .overlay(Text(String(pin.businessName.prefix(1))).foregroundColor(.white).fontWeight(.bold))
            VStack(alignment: .leading, spacing: 2) {
                Text(pin.businessName).font(.subheadline).fontWeight(.semibold)
                if let cat = pin.category { Text(cat).font(.caption).foregroundColor(Color(hex: "#003F87")) }
                if let addr = pin.address { Text(addr).font(.caption).foregroundColor(.secondary).lineLimit(1) }
            }
            Spacer()
            Button { onDismiss() } label: {
                Image(systemName: "xmark.circle.fill").foregroundColor(.secondary)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
        .shadow(radius: 8)
    }
}
